import type { ClientSession } from "mongoose";

import { PaymentModel } from "../models/payment.model.js";

export class PaymentRepository {
  async create(
    data: any,
    session?: ClientSession
  ) {
    const [payment] = await PaymentModel.create(
      [data],
      { session: session ?? null }
    );

    return payment;
  }

  async findByOrderId(
    orderId: string,
    session?: ClientSession
  ) {
    return PaymentModel.findOne(
      { orderId },
      null,
      { session: session ?? null }
    );
  }

  async findByTournamentAndUser(
    tournamentId: string,
    userId: string
  ) {
    return PaymentModel.findOne({
      tournamentId,
      userId,
    }).sort({
      createdAt: -1,
    });
  }

  async save(
    payment: any,
    session?: ClientSession
  ) {
    return payment.save({
      session,
    });
  }
}

export const paymentRepository =
  new PaymentRepository();
