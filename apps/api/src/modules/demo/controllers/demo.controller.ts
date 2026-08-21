import type { Request, Response, NextFunction } from "express";

import { demoService } from "../services/demo.service.js";

export const createDemoTournament = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id?: string };

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user is required.",
      });
    }

    const result =
      await demoService.createDemoTournament(user.id);

    return res.status(201).json({
      success: true,
      message:
        "Sportora QA demo tournament created successfully.",
      data: result,
    });
  } catch (error: any) {
    if (
      error.message?.startsWith(
        "Demo tournament already exists:"
      )
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const generateDemoFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId =
      req.params.tournamentId as string;

    const result =
      await demoService.generateFixtures(
        tournamentId
      );

    return res.status(201).json({
      success: true,
      message:
        "Demo knockout fixtures generated successfully.",
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === "Tournament not found." ||
      error.message ===
        "At least 2 registered players are required to generate fixtures." ||
      error.message ===
        "Fixtures have already been generated for this tournament." ||
      error.message ===
        "Fixtures can only be generated for approved tournaments."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const simulateNextMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const result =
      await demoService.simulateNextMatch(tournamentId);

    return res.status(200).json({
      success: true,
      message: "Demo match simulated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const simulateAllMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const result =
      await demoService.simulateAllMatches(tournamentId);

    return res.status(200).json({
      success: true,
      message: "All playable demo matches simulated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDemoTournament = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId =
      req.params.tournamentId as string;

    const result =
      await demoService.getDemoTournament(
        tournamentId
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetDemoTournament = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      await demoService.resetDemoTournament();

    return res.status(200).json({
      success: true,
      message:
        "Sportora QA demo data reset successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
