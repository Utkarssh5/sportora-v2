import { tournamentRegistrationRepository } from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";
import { tournamentRepository } from "../../tournaments/repositories/tournament.repository.js";
import { matchRepository } from "../repositories/match.repository.js";
import { MatchRound } from "../models/match.model.js";

class FixtureService {
  async generateSingleElimination(tournamentId: string) {
    // 1. Check tournament
    const tournament = await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== "APPROVED") {
      throw new Error(
        "Fixtures can only be generated for approved tournaments."
      );
    }

    // 2. Get registered players
    const registrations =
      await tournamentRegistrationRepository.findByTournament(
        tournamentId
      );

    if (registrations.length < 2) {
      throw new Error(
        "At least 2 registered players are required to generate fixtures."
      );
    }

    // 3. Prevent duplicate fixtures
    const existingMatches =
      await matchRepository.findByTournament(tournamentId);

    if (existingMatches.length > 0) {
      throw new Error(
        "Fixtures have already been generated for this tournament."
      );
    }

    // 4. Extract player IDs
    const players = registrations.map((registration) =>
      registration.userId.toString()
    );

    // 5. Shuffle players
    const shuffledPlayers = [...players].sort(
      () => Math.random() - 0.5
    );

    // 6. Find next power of 2
    let bracketSize = 1;

    while (bracketSize < shuffledPlayers.length) {
      bracketSize *= 2;
    }

    // 7. Add BYEs
    while (shuffledPlayers.length < bracketSize) {
      shuffledPlayers.push("BYE");
    }

    // 8. Determine first round
    const firstRound = this.getRoundName(bracketSize);

    const matches = [];

    // 9. Create first-round matches
    for (let i = 0; i < bracketSize; i += 2) {
      const teamA = shuffledPlayers[i];
      const teamB = shuffledPlayers[i + 1];

      if (teamA === undefined || teamB === undefined) {
        throw new Error("Invalid fixture generation.");
      }

      const matchNumber = i / 2 + 1;

      matches.push({
        tournamentId,
        round: firstRound,
        matchNumber,
        teamA,
        teamB,
      });
    }

    // 10. Create next rounds
    let currentRoundSize = bracketSize / 2;
    let matchNumber = matches.length + 1;

    while (currentRoundSize >= 1) {
      if (currentRoundSize === 1) {
        break;
      }

      const nextRound = this.getRoundName(currentRoundSize);

      for (let i = 0; i < currentRoundSize / 2; i++) {
        matches.push({
          tournamentId,
          round: nextRound,
          matchNumber,
          teamA: "TBD",
          teamB: "TBD",
        });

        matchNumber++;
      }

      currentRoundSize /= 2;
    }

    // 11. Save matches
    const createdMatches = [];

    for (const match of matches) {
      const created = await matchRepository.create(match);
      createdMatches.push(created);
    }

    return {
      tournamentId,
      totalPlayers: players.length,
      bracketSize,
      totalMatches: createdMatches.length,
      matches: createdMatches,
    };
  }

  private getRoundName(size: number): MatchRound {
    switch (size) {
      case 2:
        return MatchRound.FINAL;

      case 4:
        return MatchRound.SEMI_FINAL;

      case 8:
        return MatchRound.QUARTER_FINAL;

      default:
        return MatchRound.ROUND_1;
    }
  }
}

export const fixtureService = new FixtureService();
