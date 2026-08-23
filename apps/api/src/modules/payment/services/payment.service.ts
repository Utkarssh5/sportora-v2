import crypto from "node:crypto";
import mongoose from "mongoose";

import {
  PaymentStatus,
} from "../models/payment.model.js";

import { paymentRepository } from "../repositories/payment.repository.js";
import { TournamentModel } from "../../tournaments/models/tournament.model.js";
import {
  tournamentRegistrationRepository,
} from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";


import {
  tournamentRepository,
} from "../../tournaments/repositories/tournament.repository.js";

import {
  RegistrationStatus,
} from "../../tournamentRegistration/models/tournamentRegistration.model.js";

import {
  competitionEntryService,
} from "../../competitionEntry/services/competitionEntry.service.js";

import {
  razorpay,
} from "../../../config/razorpay.js";

import {
  env,
} from "../../../config/env.js";

export class PaymentService {
  async createOrder(data: {
    tournamentId: string;
    userId: string;
  }) {
    const tournament =
      await TournamentModel.findById(data.tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (
      tournament.organizerId.toString() ===
      data.userId
    ) {
      throw new Error(
        "You cannot register for your own tournament"
      );
    }

    if (tournament.status !== "APPROVED") {
      throw new Error(
        "Tournament is not open for payment."
      );
    }

    if (new Date() > tournament.registrationDeadline) {
      throw new Error(
        "Registration deadline has passed."
      );
    }

    if (
      tournament.registeredParticipants >=
      tournament.maxParticipants
    ) {
      throw new Error(
        "Tournament registration is full."
      );
    }

    if (tournament.entryFee <= 0) {
      throw new Error(
        "This tournament does not require payment."
      );
    }

    const existingRegistration =
      await tournamentRegistrationRepository.findByTournamentAndUser(
        data.tournamentId,
        data.userId
      );

    if (
      existingRegistration &&
      existingRegistration.status === RegistrationStatus.REGISTERED
    ) {
      throw new Error(
        "You are already registered for this tournament."
      );
    }
    if (!razorpay) {
      throw new Error("Payment gateway is not configured.");
    }


    const amountInPaise =
      Math.round(tournament.entryFee * 100);

    const order =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt:
          `tournament_${data.tournamentId}_${Date.now()}`,
        notes: {
          tournamentId: data.tournamentId,
          userId: data.userId,
        },
      });

    return paymentRepository.create({
      tournamentId: data.tournamentId,
      userId: data.userId,
      amount: tournament.entryFee,
      currency: "INR",
      orderId: order.id,
      status: PaymentStatus.CREATED,
    });
  }

  async verifyPayment(data: {
    orderId: string;
    paymentId: string;
    signature: string;
    userId: string;
  }) {
    if (!razorpay) {
      throw new Error(
        "Payment gateway is not configured."
      );
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Payment gateway secret is not configured."
      );
    }

    const payment =
      await paymentRepository.findByOrderId(
        data.orderId
      );

    if (!payment) {
      throw new Error("Order not found.");
    }

    if (
      payment.userId.toString() !== data.userId
    ) {
      throw new Error(
        "You are not allowed to verify this payment."
      );
    }

    if (
      payment.status === PaymentStatus.SUCCESS
    ) {
      if (payment.paymentId === data.paymentId) {
        return payment;
      }

      throw new Error(
        "This order has already been verified with a different payment."
      );
    }

    const body =
      `${data.orderId}|${data.paymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const receivedBuffer =
      Buffer.from(data.signature);

    if (
      expectedBuffer.length !==
      receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      throw new Error(
        "Invalid payment signature."
      );
    }

    const razorpayPayment =
      await razorpay.payments.fetch(
        data.paymentId
      );

    if (
      razorpayPayment.order_id !== data.orderId
    ) {
      throw new Error(
        "Payment does not belong to this order."
      );
    }

    if (
      razorpayPayment.status !== "captured"
    ) {
      throw new Error(
        "Payment has not been captured."
      );
    }

    if (razorpayPayment.currency !== payment.currency) {
      throw new Error(
        "Payment currency does not match the tournament payment currency."
      );
    }

    const expectedAmount =
      Math.round(payment.amount * 100);

    if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {
      throw new Error(
        "Payment amount does not match the tournament entry fee."
      );
    }

    const session =
      await mongoose.startSession();

    try {
      let verifiedPayment;

      await session.withTransaction(
        async () => {
          const lockedPayment =
            await paymentRepository.findByOrderId(
              data.orderId,
              session
            );

          if (!lockedPayment) {
            throw new Error(
              "Order not found."
            );
          }

          if (
            lockedPayment.userId.toString() !==
            data.userId
          ) {
            throw new Error(
              "You are not allowed to verify this payment."
            );
          }

          if (
            lockedPayment.status ===
            PaymentStatus.SUCCESS
          ) {
            verifiedPayment =
              lockedPayment;
            return;
          }

          const tournament =
            await TournamentModel.findById(
              lockedPayment.tournamentId
            ).session(session);

          if (!tournament) {
            throw new Error(
              "Tournament not found."
            );
          }

          if (
            tournament.organizerId.toString() ===
            data.userId
          ) {
            throw new Error(
              "You cannot register for your own tournament"
            );
          }

          if (
            tournament.status !== "APPROVED"
          ) {
            throw new Error(
              "Tournament is not open for registration."
            );
          }

          if (
            new Date() >
            tournament.registrationDeadline
          ) {
            throw new Error(
              "Registration deadline has passed."
            );
          }

          const existingRegistration =
            await tournamentRegistrationRepository
              .findByTournamentAndUser(
                lockedPayment.tournamentId.toString(),
                data.userId,
                session
              );

          if (
            existingRegistration &&
            existingRegistration.status ===
              RegistrationStatus.REGISTERED
          ) {
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
                tournamentId:
                  lockedPayment.tournamentId.toString(),
                registrationId:
                  existingRegistration._id.toString(),
                captainId:
                  data.userId,
                competitionType,
              },
              session
            );

            lockedPayment.paymentId =
              data.paymentId;

            lockedPayment.signature =
              data.signature;

            lockedPayment.status =
              PaymentStatus.SUCCESS;

            verifiedPayment =
              await paymentRepository.save(
                lockedPayment,
                session
              );

            return;
          }

          const reservedTournament =
            await tournamentRepository
              .reserveRegistrationSlot(
                lockedPayment.tournamentId.toString(),
                session
              );

          if (!reservedTournament) {
            throw new Error(
              "Tournament registration is full."
            );
          }

          let registration;

          if (
            existingRegistration &&
            existingRegistration.status ===
              RegistrationStatus.CANCELLED
          ) {
            registration =
              await tournamentRegistrationRepository
                .reactivate(
                  existingRegistration._id.toString(),
                  session
                );

            if (!registration) {
              throw new Error(
                "Registration could not be reactivated."
              );
            }
          } else {
            registration =
              await tournamentRegistrationRepository.create(
                {
                  tournamentId:
                    lockedPayment.tournamentId,
                  userId:
                    lockedPayment.userId,
                  status:
                    RegistrationStatus.REGISTERED,
                  ticketId:
                    `SPT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
                },
                session
              );
          }

          if (!registration) {
            throw new Error(
              "Registration could not be created."
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
              tournamentId:
                lockedPayment.tournamentId.toString(),
              registrationId:
                registration._id.toString(),
              captainId:
                lockedPayment.userId.toString(),
              competitionType,
            },
            session
          );

          lockedPayment.paymentId =
            data.paymentId;

          lockedPayment.signature =
            data.signature;

          lockedPayment.status =
            PaymentStatus.SUCCESS;

          verifiedPayment =
            await paymentRepository.save(
              lockedPayment,
              session
            );
        }
      );

      return verifiedPayment;
    } finally {
      await session.endSession();
    }
  }
}

export const paymentService =
  new PaymentService();
