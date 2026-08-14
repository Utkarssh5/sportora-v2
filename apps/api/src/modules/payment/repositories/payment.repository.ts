import { PaymentModel } from "../models/payment.model.js";

export class PaymentRepository {
  async create(data: any) {
    return PaymentModel.create(data);
  }

  async findByOrderId(orderId: string) {
    return PaymentModel.findOne({ orderId });
  }

  async save(payment: any) {
    return payment.save();
  }
}

export const paymentRepository = new PaymentRepository();
