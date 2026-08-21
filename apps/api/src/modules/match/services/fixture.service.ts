import mongoose from "mongoose";

import { competitionEntryRepository } from "../../competitionEntry/repositories/competitionEntry.repository.js";
import { tournamentRepository } from "../../tournaments/repositories/tournament.repository.js";
import { matchRepository } from "../repositories/match.repository.js";
import {
  MatchRound,
  MatchStatus,
} from "../models/match.model.js";

import {
  createKnockoutFixturePlan,
} from "./knockout/knockout.engine.js";

class FixtureService {
  async generateSingleElimination(tournamentId: string) {
    const tournament =
      await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== "APPROVED") {
      throw new Error(
        "Fixtures can only be generated for approved tournaments."
      );
    }

    const competitionType =
      tournament.competitionType ??
      (
        tournament.type === "SOLO"
          ? "SINGLES"
          : tournament.type === "DUO"
            ? "DOUBLES"
            : "TEAM"
      );

    const normalizedFormat =
      tournament.format.trim().toUpperCase();

    if (normalizedFormat !== "KNOCKOUT") {
      throw new Error(
        "Knockout fixture generation currently supports only KNOCKOUT format."
      );
    }

    if (new Date() <= tournament.registrationDeadline) {
      throw new Error(
        "Fixtures can only be generated after the registration deadline."
      );
    }

    const approvedEntries =
      await competitionEntryRepository.findApprovedByTournament(
        tournamentId
      );

    if (approvedEntries.length < 2) {
      throw new Error(
        "At least 2 approved competition entries are required to generate fixtures."
      );
    }

    if (approvedEntries.length > 100) {
      throw new Error(
        "Knockout tournaments support a maximum of 100 competition entries."
      );
    }

    const existingMatches =
      await matchRepository.findByTournament(
        tournamentId
      );

    if (existingMatches.length > 0) {
      throw new Error(
        "Fixtures have already been generated for this tournament."
      );
    }

    const participants = approvedEntries.map(
      (entry) => ({
        participantId: entry._id.toString(),
        participantType:
          competitionType as
            | "SINGLES"
            | "DOUBLES"
            | "MIXED_DOUBLES"
            | "TEAM"
            | "RELAY",
        displayName:
          entry.displayName?.trim() ||
          `Entry ${entry._id.toString().slice(-6)}`,
      })
    );

    const plan =
      createKnockoutFixturePlan(
        participants
      );

    const session =
      await mongoose.startSession();

    try {
      let result:
        | {
            tournamentId: string;
            totalPlayers: number;
            bracketSize: number;
            totalMatches: number;
            matches: any[];
          }
        | undefined;

      await session.withTransaction(
        async () => {
          /*
           * Create every Match document from the pure
           * knockout engine plan.
           *
           * The engine owns bracket structure.
           * MongoDB only stores the persistence representation.
           */
          const createdMatches = [];

          for (const plannedMatch of plan.matches) {
            const roundMatchCount =
              plan.summary.roundMatchCounts[
                plannedMatch.roundNumber - 1
              ];

            if (roundMatchCount === undefined) {
              throw new Error(
                "Invalid fixture plan: round match count could not be resolved."
              );
            }

            const round =
              this.getRoundName(
                roundMatchCount,
                plannedMatch.roundNumber
              );

            const teamA =
              plannedMatch.participantA?.participantId ??
              "TBD";

            const teamB =
              plannedMatch.participantB?.participantId ??
              (plannedMatch.isBye ? "BYE" : "TBD");

            const created =
              await matchRepository.create(
                {
                  tournamentId,
                  round,
                  matchNumber:
                    plannedMatch.matchNumber,
                  teamA,
                  teamB,
                },
                session
              );

            createdMatches.push(created);
          }

          /*
           * Link every non-final match to its actual
           * MongoDB nextMatchId.
           */
          for (
            let index = 0;
            index < plan.matches.length;
            index++
          ) {
            const plannedMatch =
              plan.matches[index];

            const createdMatch =
              createdMatches[index];

            if (
              !plannedMatch ||
              !createdMatch
            ) {
              throw new Error(
                "Invalid fixture plan: match could not be resolved."
              );
            }

            if (
              plannedMatch.nextMatchIndex ===
              undefined
            ) {
              continue;
            }

            const nextMatch =
              createdMatches[
                plannedMatch.nextMatchIndex
              ];

            if (!nextMatch) {
              throw new Error(
                "Invalid fixture plan: next match could not be resolved."
              );
            }

            createdMatch.nextMatchId =
              nextMatch._id;

            await matchRepository.update(
              createdMatch,
              session
            );
          }

          /*
           * Resolve only BYEs whose participant is already
           * known by the pure engine.
           *
           * Opening-round BYE:
           *   player + BYE
           *
           * Later structural BYE:
           *   TBD + BYE
           *
           * The latter must wait for the previous match winner.
           */
          for (
            let index = 0;
            index < plan.matches.length;
            index++
          ) {
            const plannedMatch =
              plan.matches[index];

            const createdMatch =
              createdMatches[index];

            if (
              !plannedMatch ||
              !createdMatch ||
              !plannedMatch.isBye
            ) {
              continue;
            }

            const advancingPlayer =
              plannedMatch.participantA?.participantId;

            if (!advancingPlayer) {
              /*
               * Structural later-round BYE.
               * Its participant will arrive through
               * winner advancement from the previous match.
               */
              createdMatch.status =
                MatchStatus.CANCELLED;

              await matchRepository.update(
                createdMatch,
                session
              );

              continue;
            }

            if (
              plannedMatch.nextMatchIndex ===
              undefined
            ) {
              throw new Error(
                "BYE match has no next match."
              );
            }

            createdMatch.status =
              MatchStatus.CANCELLED;

            await matchRepository.update(
              createdMatch,
              session
            );

            const nextMatch =
              createdMatches[
                plannedMatch.nextMatchIndex
              ];

            if (!nextMatch) {
              throw new Error(
                "Next match could not be found while resolving BYE."
              );
            }

            if (nextMatch.teamA === "TBD") {
              nextMatch.teamA =
                advancingPlayer;
            } else if (
              nextMatch.teamB === "TBD"
            ) {
              nextMatch.teamB =
                advancingPlayer;
            } else if (
              nextMatch.teamA !==
                advancingPlayer &&
              nextMatch.teamB !==
                advancingPlayer
            ) {
              throw new Error(
                "Next match already contains two different players."
              );
            }

            await matchRepository.update(
              nextMatch,
              session
            );
          }

          result = {
            tournamentId,
            totalPlayers:
              plan.summary.participantCount,
            bracketSize:
              plan.summary.bracketSize,
            totalMatches:
              createdMatches.length,
            matches: createdMatches,
          };
        }
      );

      if (!result) {
        throw new Error(
          "Fixture generation transaction completed without a result."
        );
      }

      return result;
    } finally {
      await session.endSession();
    }
  }

  private getRoundName(
    matchCount: number,
    roundNumber: number
  ): MatchRound {
    switch (matchCount) {
      case 1:
        return MatchRound.FINAL;

      case 2:
        return MatchRound.SEMI_FINAL;

      case 4:
        return MatchRound.QUARTER_FINAL;

      case 8:
        return MatchRound.ROUND_OF_16;

      case 16:
        return MatchRound.ROUND_OF_32;

      case 32:
        return MatchRound.ROUND_OF_64;

      default:
        switch (roundNumber) {
          case 1:
            return MatchRound.ROUND_1;

          case 2:
            return MatchRound.ROUND_2;

          case 3:
            return MatchRound.ROUND_3;

          case 4:
            return MatchRound.ROUND_4;

          case 5:
            return MatchRound.ROUND_5;

          default:
            throw new Error(
              "Unsupported knockout round."
            );
        }
    }
  }
}

export const fixtureService =
  new FixtureService();
