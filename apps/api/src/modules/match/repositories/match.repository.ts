import { MatchModel } from "../models/match.model.js";

export class MatchRepository {
  async create(data: {
    tournamentId: string;
    round: string;
    matchNumber: number;
    teamA: string;
    teamB: string;
    nextMatchId?: string;
  }) {
    return MatchModel.create(data);
  }

  async findById(matchId: string) {
    return MatchModel.findById(matchId);
  }

  async findByTournament(tournamentId: string) {
    return MatchModel.find({
      tournamentId,
    }).sort({
      matchNumber: 1,
    });
  }

  async update(match: any) {
    return match.save();
  }

  async deleteByTournament(tournamentId: string): Promise<{ deletedCount: number }> {
  const result = await MatchModel.deleteMany({
    tournamentId,
  });

  return {
    deletedCount: result.deletedCount,
  };
}
}

export const matchRepository = new MatchRepository();
