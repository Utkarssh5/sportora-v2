import { matchRepository } from "../repositories/match.repository.js";
import {
  MatchRound,
  MatchStatus,
} from "../models/match.model.js";
import { tournamentRepository } from "../../tournaments/repositories/tournament.repository.js";
import { TournamentStatus } from "../../tournaments/models/tournament.model.js";
import { User } from "../../users/models/user.model.js";

export class MatchService {
  async createMatch(data: {
    tournamentId: string;
    round: MatchRound;
    matchNumber: number;
    teamA: string;
    teamB: string;
    nextMatchId?: string;
  }) {
    return matchRepository.create(data);
  }

  async updateScore(
    matchId: string,
    data: {
      scoreA?: number;
      scoreB?: number;
      currentSet?: number;
      status?: MatchStatus;
      winner?: string;
    }
  ) {
    const match = await matchRepository.findById(matchId);

    if (!match) {
      throw new Error("Match not found.");
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new Error("Match has already been completed.");
    }

    if (data.scoreA !== undefined) {
      match.scoreA = data.scoreA;
    }

    if (data.scoreB !== undefined) {
      match.scoreB = data.scoreB;
    }

    if (data.currentSet !== undefined) {
      match.currentSet = data.currentSet;
    }

    if (data.status !== undefined) {
      match.status = data.status;
    }

    if (data.winner !== undefined) {
      match.winner = data.winner;
    }

    /*
     * A completed match must have a valid winner.
     * We intentionally do not auto-pick a winner from the score because
     * some sports can end in draws/tiebreaks and the organizer may
     * explicitly provide the winner.
     */
    if (match.status === MatchStatus.COMPLETED) {
      if (!match.winner) {
        throw new Error(
          "A winner is required when completing a match."
        );
      }

      if (
        match.teamA === "TBD" ||
        match.teamB === "TBD"
      ) {
        throw new Error(
          "Both players must be assigned before completing a match."
        );
      }

      if (
        match.teamA === "BYE" ||
        match.teamB === "BYE"
      ) {
        throw new Error(
          "BYE matches are completed automatically and cannot be scored manually."
        );
      }

      if (
        match.winner === "TBD" ||
        match.winner === "BYE"
      ) {
        throw new Error(
          "Winner must be a real player in the match."
        );
      }

      if (
        match.winner !== match.teamA &&
        match.winner !== match.teamB
      ) {
        throw new Error(
          "Winner must be one of the players in the match."
        );
      }

      if (match.round === MatchRound.FINAL) {
        await this.completeTournament(match);
      } else {
        await this.advanceWinner(match);
      }
    }

    return matchRepository.update(match);
  }

  private async completeTournament(match: any) {
    if (!match.winner) {
      return;
    }

    const tournament =
      await tournamentRepository.findById(
        match.tournamentId.toString()
      );

    if (!tournament) {
      throw new Error(
        "Tournament not found for final match."
      );
    }

    if (tournament.status === TournamentStatus.COMPLETED) {
      return;
    }

    await tournamentRepository.update(
      match.tournamentId.toString(),
      {
        status: TournamentStatus.COMPLETED,
      }
    );
  }

  private async advanceWinner(match: any) {
    if (!match.nextMatchId || !match.winner) {
      return;
    }

    const nextMatch =
      await matchRepository.findById(
        match.nextMatchId.toString()
      );

    if (!nextMatch) {
      throw new Error(
        "Next match could not be found for winner advancement."
      );
    }

    /*
     * Structural BYE:
     *
     * The next match was generated as:
     *
     *   TBD vs BYE
     *
     * The winner arriving here automatically occupies
     * the TBD slot and immediately advances through
     * the BYE to the following match.
     */
    const isStructuralBye =
      nextMatch.teamA === "TBD" &&
      nextMatch.teamB === "BYE";

    if (isStructuralBye) {
      /*
       * The winner has automatically won this
       * structural BYE slot.
       */
      nextMatch.teamA = match.winner;
      nextMatch.winner = match.winner;
      nextMatch.status = MatchStatus.CANCELLED;

      await matchRepository.update(nextMatch);

      /*
       * Continue the same winner through the bracket.
       * This is safe because the structural BYE now
       * has an explicit winner.
       */
      await this.advanceWinner(nextMatch);

      return;
    }

    if (
      nextMatch.teamA === match.winner ||
      nextMatch.teamB === match.winner
    ) {
      return;
    }

    if (nextMatch.teamA === "TBD") {
      nextMatch.teamA = match.winner;
    } else if (nextMatch.teamB === "TBD") {
      nextMatch.teamB = match.winner;
    } else {
      throw new Error(
        "Next match already has two teams assigned."
      );
    }

    await matchRepository.update(nextMatch);
  }

  async getMatchDetails(matchId: string) {
    const match = await matchRepository.findById(matchId);

    if (!match) {
      throw new Error("Match not found.");
    }

    return match;
  }

  async getTournamentMatches(tournamentId: string) {
    const matches =
      await matchRepository.findByTournament(
        tournamentId
      );

    const playerIds = [
      ...new Set(
        matches
          .flatMap((match) => [
            match.teamA,
            match.teamB,
          ])
          .filter(
            (id) =>
              id !== "TBD" &&
              id !== "BYE"
          )
      ),
    ];

    const players = await User.find({
      _id: {
        $in: playerIds,
      },
    }).select(
      "_id fullName profileImage city state role"
    );

    const playerMap = new Map(
      players.map((player) => [
        player._id.toString(),
        player,
      ])
    );

    return matches.map((match) => {
      const playerA =
        playerMap.get(match.teamA);

      const playerB =
        playerMap.get(match.teamB);

      return {
        ...match.toObject(),
        playerA: playerA
          ? {
              id: playerA._id.toString(),
              fullName: playerA.fullName,
              profileImage:
                playerA.profileImage ?? "",
              city: playerA.city ?? "",
              state: playerA.state ?? "",
              role: playerA.role,
            }
          : null,
        playerB: playerB
          ? {
              id: playerB._id.toString(),
              fullName: playerB.fullName,
              profileImage:
                playerB.profileImage ?? "",
              city: playerB.city ?? "",
              state: playerB.state ?? "",
              role: playerB.role,
            }
          : null,
      };
    });
  }
}

export const matchService = new MatchService();
