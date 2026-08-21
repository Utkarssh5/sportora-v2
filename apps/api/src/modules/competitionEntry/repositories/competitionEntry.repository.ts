import type { ClientSession } from "mongoose";

import {
  CompetitionEntry,
  CompetitionEntryStatus,
} from "../models/competitionEntry.model.js";

class CompetitionEntryRepository {
  async create(
    data: any,
    session?: ClientSession
  ) {
    const [entry] = await CompetitionEntry.create(
      [data],
      { session: session ?? null }
    );

    return entry;
  }

  async findByRegistrationId(
    registrationId: string,
    session?: ClientSession
  ) {
    return CompetitionEntry.findOne(
      { registrationId },
      null,
      { session: session ?? null }
    );
  }

  async findById(
    id: string,
    session?: ClientSession
  ) {
    return CompetitionEntry.findById(
      id,
      null,
      { session: session ?? null }
    );
  }

  async findByTournament(
    tournamentId: string
  ) {
    return CompetitionEntry.find({
      tournamentId,
    }).sort({
      createdAt: 1,
    });
  }

  async findApprovedByTournament(
    tournamentId: string
  ) {
    return CompetitionEntry.find({
      tournamentId,
      status: CompetitionEntryStatus.APPROVED,
    }).sort({
      createdAt: 1,
    });
  }

  async findByParticipantUserId(
    userId: string
  ) {
    return CompetitionEntry.find({
      "participants.userId": userId,
    }).sort({
      createdAt: 1,
    });
  }

  async update(
    entry: any,
    session?: ClientSession
  ) {
    return entry.save({
      session: session ?? undefined,
    });
  }
}

export const competitionEntryRepository =
  new CompetitionEntryRepository();
