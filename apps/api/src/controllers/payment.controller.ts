import type { Request, Response } from 'express';
import { PaymentModel, PaymentStatus } from '../models/payment.model.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tournamentId, userId, amount } = req.body;
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await PaymentModel.create({
      tournamentId,
      userId,
      amount,
      orderId,
      status: PaymentStatus.CREATED,
    });

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully.',
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const payment = await PaymentModel.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = PaymentStatus.SUCCESS;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
