import { matchRepository } from "../repositories/match.repository.js";
import {
  MatchRound,
  MatchStatus,
} from "../models/match.model.js";

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

    return matchRepository.update(match);
  }

  async getMatchDetails(matchId: string) {
    const match = await matchRepository.findById(matchId);

    if (!match) {
      throw new Error("Match not found.");
    }

    return match;
  }

  async getTournamentMatches(tournamentId: string) {
    return matchRepository.findByTournament(tournamentId);
  }
}

export const matchService = new MatchService();
