import mongoose from "mongoose";
import { MatchModel } from "../models/match.model.js";

export class MatchRepository {
  async create(
    data: {
      tournamentId: string;
      round: string;
      matchNumber: number;
      teamA: string;
      teamB: string;
      nextMatchId?: string;
    },
    session?: mongoose.ClientSession
  ) {
    if (session) {
      const [match] = await MatchModel.create(
        [data],
        { session }
      );

      if (!match) {
        throw new Error(
          "Match creation failed."
        );
      }

      return match;
    }

    return MatchModel.create(data);
  }

  async findById(
    matchId: string,
    session?: mongoose.ClientSession
  ) {
    return MatchModel.findById(
      matchId
    ).session(session ?? null);
  }

  async findByTournament(
    tournamentId: string,
    session?: mongoose.ClientSession
  ) {
    return MatchModel.find({
      tournamentId,
    })
      .sort({
        matchNumber: 1,
      })
      .session(session ?? null);
  }

  async findCompletedByPlayer(
    userId: string
  ) {
    return MatchModel.find({
      status: "COMPLETED",
      $or: [
        { teamA: userId },
        { teamB: userId },
      ],
    }).sort({
      updatedAt: 1,
    });
  }

  async findCompletedByEntryIds(
    entryIds: string[]
  ) {
    if (entryIds.length === 0) {
      return [];
    }

    return MatchModel.find({
      status: "COMPLETED",
      $or: [
        { teamA: { $in: entryIds } },
        { teamB: { $in: entryIds } },
      ],
    }).sort({
      updatedAt: 1,
    });
  }

  async update(
    match: any,
    session?: mongoose.ClientSession
  ) {
    return match.save({
      session,
    });
  }

  async deleteByTournament(
    tournamentId: string
  ): Promise<{ deletedCount: number }> {
    const result =
      await MatchModel.deleteMany({
        tournamentId,
      });

    return {
      deletedCount: result.deletedCount,
    };
  }
}

export const matchRepository =
  new MatchRepository();
