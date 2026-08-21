import type { Request, Response, NextFunction } from "express";

import {
  crewSettlementService,
} from "../services/crew-settlement.service.js";

export const markDemoPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settlement =
      await crewSettlementService.markDemoPaid(
        req.params.settlementId as string
      );

    return res.status(200).json({
      success: true,
      message: "Demo crew settlement marked as paid.",
      data: settlement,
    });
  } catch (error: any) {
    if (
      error.message === "Settlement not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "Only pending settlements can be marked as paid."
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};
