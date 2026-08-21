import type { Request, Response } from "express";
import {
  SPORT_COMPETITION_CONFIG,
  getAllowedCompetitionTypes,
} from "../config/sport-competition.config.js";

class SportsController {
  async getConfig(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      sports: SPORT_COMPETITION_CONFIG,
    });
  }

  async getCompetitions(req: Request, res: Response) {
    const sport = String(req.params.sport ?? "").trim();

    const competitions = getAllowedCompetitionTypes(sport);

    if (competitions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sport not found.",
      });
    }

    return res.status(200).json({
      success: true,
      sport,
      competitions,
    });
  }
}

export const sportsController = new SportsController();
