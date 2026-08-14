import {
  PaymentStatus,
} from "../models/payment.model.js";

import { paymentRepository } from "../repositories/payment.repository.js";
import { TournamentModel } from "../../tournaments/models/tournament.model.js";

export class PaymentService {
  async createOrder(data: {
    tournamentId: string;
    userId: string;
  }) {
    const tournament = await TournamentModel.findById(data.tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== "APPROVED") {
      throw new Error("Tournament is not open for payment.");
    }

    if (tournament.entryFee <= 0) {
      throw new Error("This tournament does not require payment.");
    }

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return paymentRepository.create({
      tournamentId: data.tournamentId,
      userId: data.userId,
      amount: tournament.entryFee,
      orderId,
      status: PaymentStatus.CREATED,
    });
  }

  async verifyPayment(_data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    throw new Error(
      "Payment gateway verification is not configured yet."
    );
  }
}

export const paymentService = new PaymentService();
