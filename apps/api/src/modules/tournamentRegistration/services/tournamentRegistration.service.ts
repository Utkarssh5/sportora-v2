import mongoose from "mongoose";
import crypto from "node:crypto";

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

import {
  paymentRepository,
} from "../../payment/repositories/payment.repository.js";

import {
  PaymentStatus,
} from "../../payment/models/payment.model.js";

import {
  competitionEntryService,
} from "../../competitionEntry/services/competitionEntry.service.js";

class TournamentRegistrationService {

  private generateTicketId() {
    const year = new Date().getFullYear();
    const token = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `SPT-${year}-${token}`;
  }

  async register(
    tournamentId: string,
    userId: string
  ) {
    const tournament =
      await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.organizerId.toString() === userId) {
      throw new Error(
        "You cannot register for your own tournament"
      );
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
        } else {
          registration =
            await tournamentRegistrationRepository.create(
              {
                tournamentId: tournament._id,
                userId: userId as any,
                status: RegistrationStatus.REGISTERED,
                ticketId: this.generateTicketId(),
              },
              session
            );
        }

        if (!registration) {
          throw new Error(
            "Registration could not be created"
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

        await competitionEntryService.ensureForRegistration(
          {
            tournamentId: tournament._id.toString(),
            registrationId: registration._id.toString(),
            captainId: userId,
            competitionType,
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
    const registrations =
      await tournamentRegistrationRepository.findByUser(
        userId
      );

    return Promise.all(
      registrations.map(async (registration) => {
        const payment =
          await paymentRepository.findByTournamentAndUser(
            registration.tournamentId._id.toString(),
            userId
          );

        let ticketId = registration.ticketId;

        if (!ticketId) {
          ticketId = this.generateTicketId();

          await tournamentRegistrationRepository.assignTicketId(
            registration._id.toString(),
            ticketId
          );
        }

        return {
          ...registration.toObject(),
          ticketId,
          paymentStatus: payment?.status ?? null,
          paymentId: payment?.paymentId ?? null,
          orderId: payment?.orderId ?? null,
        };
      })
    );
  }


  async verifyRegistration(
    registrationId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return {
        valid: false,
        message: "Invalid registration ID",
      };
    }

    const registration =
      await tournamentRegistrationRepository.findForVerification(
        registrationId
      );

    if (!registration) {
      return {
        valid: false,
        message: "Registration not found",
      };
    }

    const tournament = registration.tournamentId as any;

    const payment =
      await paymentRepository.findByTournamentAndUser(
        tournament._id.toString(),
        (registration.userId as any)._id.toString()
      );

    const paymentStatus = payment?.status ?? null;

    const valid =
      registration.status === RegistrationStatus.REGISTERED &&
      paymentStatus === PaymentStatus.SUCCESS;

    const player = registration.userId as any;

    let ticketId = registration.ticketId;

    if (!ticketId) {
      ticketId = this.generateTicketId();

      await tournamentRegistrationRepository.assignTicketId(
        registration._id.toString(),
        ticketId
      );
    }

    return {
      valid,
      message: valid
        ? "Valid registration"
        : "Registration is not valid",
      registration: {
        id: registration._id,
        ticketId,
        status: registration.status,
        registeredAt: registration.registeredAt,
      },
      player: {
        fullName: player?.fullName ?? "Player",
      },
      tournament: {
        id: tournament._id,
        title: tournament.title,
        sport: tournament.sport,
        format: tournament.format,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        locationName: tournament.locationName,
        city: tournament.city,
        state: tournament.state,
      },
      payment: {
        status: paymentStatus,
      },
    };
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

    const payment =
      await paymentRepository.findByTournamentAndUser(
        registration.tournamentId.toString(),
        userId
      );

    if (
      payment &&
      (
        payment.status === PaymentStatus.SUCCESS ||
        payment.status === PaymentStatus.REFUNDED
      )
    ) {
      throw new Error(
        "Registration cannot be cancelled after payment."
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
    
