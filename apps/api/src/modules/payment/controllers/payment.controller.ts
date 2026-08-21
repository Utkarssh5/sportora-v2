import type { Request, Response, NextFunction } from "express";

import { paymentService } from "../services/payment.service.js";
import { env } from "../../../config/env.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };

    const payment = await paymentService.createOrder({
      tournamentId: req.body.tournamentId,
      userId: user.id,
    });

    if (!payment) {
      throw new Error(
        "Payment order could not be created."
      );
    }

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        keyId: env.RAZORPAY_KEY_ID,
        tournamentId: payment.tournamentId,
      },
    });
  } catch (error: any) {
    if (
      error.message ===
      "You are already registered for this tournament."
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };

    const payment =
      await paymentService.verifyPayment({
        ...req.body,
        userId: user.id,
      });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: payment,
    });
  } catch (error: any) {
    if (error.message === "Order not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};
