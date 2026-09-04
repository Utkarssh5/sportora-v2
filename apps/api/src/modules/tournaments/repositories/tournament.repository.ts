import { TournamentModel } from "../models/tournament.model.js";
import type { ClientSession } from "mongoose";
import type { ITournament } from "../models/tournament.model.js";


class TournamentRepository {

  async create(data: Partial<ITournament>) {
    return await TournamentModel.create(data);
  }


  async findAll(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ) {
    return await TournamentModel
      .find(filter)
      .populate("organizerId", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }


  async count(filter: Record<string, unknown>) {
    return await TournamentModel.countDocuments(filter);
  }


  async findById(id: string) {
    return await TournamentModel.findById(id);
  }


  async findByOrganizer(organizerId: string) {
    return await TournamentModel
      .find({ organizerId })
      .sort({ createdAt: -1 });
  }

  async findActiveByOrganizer(organizerId: string) {
    return await TournamentModel.findOne({
      organizerId,
      status: {
        $in: ["PENDING_APPROVAL", "APPROVED", "ONGOING"],
      },
    }).sort({ createdAt: -1 });
  }


  async update(
    id: string,
    data: Partial<ITournament>
  ) {
    return await TournamentModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }


  async delete(id: string) {
    return await TournamentModel.findByIdAndDelete(id);
  }


  async reserveRegistrationSlot(
    id: string,
    session: ClientSession
  ) {
    return await TournamentModel.findOneAndUpdate(
      {
        _id: id,
        $expr: {
          $lt: ["$registeredParticipants", "$maxParticipants"],
        },
      },
      {
        $inc: {
          registeredParticipants: 1,
        },
      },
      {
        new: true,
        session,
      }
    );
  }


  async releaseRegistrationSlot(
    id: string,
    session: ClientSession
  ) {
    return await TournamentModel.findOneAndUpdate(
      {
        _id: id,
        registeredParticipants: { $gt: 0 },
      },
      {
        $inc: {
          registeredParticipants: -1,
        },
      },
      {
        new: true,
        session,
      }
    );
  }

}


export const tournamentRepository = new TournamentRepository();