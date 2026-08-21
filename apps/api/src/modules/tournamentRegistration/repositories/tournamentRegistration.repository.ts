import {
  RegistrationStatus,
  TournamentRegistration,
} from "../models/tournamentRegistration.model.js";

import type { ClientSession } from "mongoose";

import type {
  ITournamentRegistration,
} from "../models/tournamentRegistration.model.js";


class TournamentRegistrationRepository {

  async create(
    data: Partial<ITournamentRegistration>,
    session?: ClientSession
  ) {
    const [registration] =
      await TournamentRegistration.create([data], { session: session ?? null });

    return registration;
  }


  async findByTournamentAndUser(
    tournamentId: string,
    userId: string,
    session?: ClientSession
  ) {
    return await TournamentRegistration.findOne(
      {
        tournamentId,
        userId,
      },
      null,
      { session: session ?? null }
    );
  }


  async findByTournament(
    tournamentId: string
  ) {
    return await TournamentRegistration.find({
      tournamentId,
      status: "REGISTERED",
    }).sort({
      registeredAt: 1,
    });
  }


  async findByUser(
    userId: string
  ) {
    return await TournamentRegistration.find({
      userId,
    })
      .populate("tournamentId")
      .sort({
        registeredAt: -1,
      });
  }


  async findRegisteredByUserWithTournaments(
    userId: string
  ) {
    return await TournamentRegistration.find({
      userId,
      status: RegistrationStatus.REGISTERED,
    }).populate("tournamentId", "title startDate endDate");
  }


  async countRegistered(
    tournamentId: string
  ) {
    return await TournamentRegistration.countDocuments({
      tournamentId,
      status: "REGISTERED",
    });
  }


  async findById(
    id: string
  ) {
    return await TournamentRegistration.findById(id);
  }


  async assignTicketId(
    id: string,
    ticketId: string
  ) {
    return await TournamentRegistration.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { ticketId: { $exists: false } },
          { ticketId: null },
          { ticketId: "" },
        ],
      },
      {
        $set: { ticketId },
      },
      {
        new: true,
      }
    );
  }


  async findForVerification(
    id: string
  ) {
    return await TournamentRegistration.findById(id)
      .populate("tournamentId")
      .populate("userId", "fullName");
  }


  async cancel(
    id: string,
    session?: ClientSession
  ) {
    return await TournamentRegistration.findOneAndUpdate(
      {
        _id: id,
        status: RegistrationStatus.REGISTERED,
      },
      {
        status: RegistrationStatus.CANCELLED,
      },
      {
        new: true,
        session: session ?? null,
      }
    );
  }


  async reactivate(
    id: string,
    session?: ClientSession,
    ticketId?: string
  ) {
    return await TournamentRegistration.findOneAndUpdate(
      {
        _id: id,
        status: RegistrationStatus.CANCELLED,
      },
      {
        status: RegistrationStatus.REGISTERED,
        registeredAt: new Date(),
        ...(ticketId ? { ticketId } : {}),
      },
      {
        new: true,
        session: session ?? null,
      }
    );
  }

}


export const tournamentRegistrationRepository =
  new TournamentRegistrationRepository();
