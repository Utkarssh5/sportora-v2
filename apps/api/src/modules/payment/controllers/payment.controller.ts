import type { Request, Response, NextFunction } from "express";

import { paymentService } from "../services/payment.service.js";

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

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment = await paymentService.verifyPayment(req.body);

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
