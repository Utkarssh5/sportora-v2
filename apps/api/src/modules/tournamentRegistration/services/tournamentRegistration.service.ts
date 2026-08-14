import mongoose from "mongoose";

import {
  RegistrationStatus,
} from "../models/tournamentRegistration.model.js";

import {
  tournamentRegistrationRepository,
} from "../repositories/tournamentRegistration.repository.js";

import {
  TournamentModel,
} from "../../tournaments/models/tournament.model.js";

import {
  tournamentRepository,
} from "../../tournaments/repositories/tournament.repository.js";

class TournamentRegistrationService {

  async register(
    tournamentId: string,
    userId: string
  ) {
    const tournament =
      await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "APPROVED") {
      throw new Error(
        "Registration is available only for approved tournaments"
      );
    }

    const now = new Date();

    if (now > tournament.registrationDeadline) {
      throw new Error(
        "Registration deadline has passed"
      );
    }

    const existing =
      await tournamentRegistrationRepository.findByTournamentAndUser(
        tournamentId,
        userId
      );

    if (
      existing &&
      existing.status === RegistrationStatus.REGISTERED
    ) {
      throw new Error(
        "You are already registered for this tournament"
      );
    }

    const session = await mongoose.startSession();

    try {
      let registration;

      await session.withTransaction(async () => {
        const reservedTournament =
          await tournamentRepository.reserveRegistrationSlot(
            tournamentId,
            session
          );

        if (!reservedTournament) {
          throw new Error(
            "Tournament registration is full"
          );
        }

        if (
          existing &&
          existing.status === RegistrationStatus.CANCELLED
        ) {
          registration =
            await tournamentRegistrationRepository.reactivate(
              existing._id.toString(),
              session
            );

          if (!registration) {
            throw new Error(
              "Registration could not be reactivated"
            );
          }

          return;
        }

        registration =
          await tournamentRegistrationRepository.create(
            {
              tournamentId: tournament._id,
              userId: userId as any,
              status: RegistrationStatus.REGISTERED,
            },
            session
          );
      });

      return registration;
    } finally {
      await session.endSession();
    }
  }


  async getParticipants(
    tournamentId: string,
    user: { id: string; role: string }
  ) {
    const tournament =
      await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (
      user.role !== "ADMIN" &&
      (
        user.role !== "ORGANIZER" ||
        tournament.organizerId.toString() !== user.id
      )
    ) {
      throw new Error(
        "You do not have permission to view tournament participants."
      );
    }

    return tournamentRegistrationRepository.findByTournament(
      tournamentId
    );
  }


  async getMyRegistrations(
    userId: string
  ) {
    return tournamentRegistrationRepository.findByUser(
      userId
    );
  }


  async cancel(
    registrationId: string,
    userId: string
  ) {
    const registration =
      await tournamentRegistrationRepository.findById(
        registrationId
      );

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (
      registration.userId.toString() !== userId
    ) {
      throw new Error(
        "You are not allowed to cancel this registration"
      );
    }

    if (
      registration.status === RegistrationStatus.CANCELLED
    ) {
      throw new Error(
        "Registration is already cancelled"
      );
    }

    const session = await mongoose.startSession();

    try {
      let cancelledRegistration;

      await session.withTransaction(async () => {
        const cancelled =
          await tournamentRegistrationRepository.cancel(
            registrationId,
            session
          );

        if (!cancelled) {
          throw new Error(
            "Registration could not be cancelled"
          );
        }

        const releasedTournament =
          await tournamentRepository.releaseRegistrationSlot(
            registration.tournamentId.toString(),
            session
          );

        if (!releasedTournament) {
          throw new Error(
            "Tournament registration counter could not be updated"
          );
        }

        cancelledRegistration = cancelled;
      });

      return cancelledRegistration;
    } finally {
      await session.endSession();
    }
  }
}


export const tournamentRegistrationService =
  new TournamentRegistrationService();
    
