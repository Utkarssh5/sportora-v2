import type { Request, Response, NextFunction } from "express";

import { fixtureService } from "../services/fixture.service.js";

export const generateFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const result =
      await fixtureService.generateSingleElimination(
        tournamentId
      );

    return res.status(201).json({
      success: true,
      message: "Single-elimination fixtures generated successfully.",
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === "Tournament not found." ||
      error.message ===
        "At least 2 approved competition entries are required to generate fixtures." ||
      error.message ===
        "Fixtures have already been generated for this tournament." ||
      error.message ===
        "Fixtures can only be generated for approved tournaments." ||
      error.message ===
        "Knockout fixture generation currently supports only KNOCKOUT format." ||
      error.message ===
        "Fixtures can only be generated after the registration deadline." ||
      error.message ===
        "Knockout tournaments support a maximum of 100 competition entries."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

