import type { Request, Response, NextFunction } from "express";

import { matchService } from "../services/match.service.js";
import { MatchRound, MatchStatus } from "../models/match.model.js";

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      tournamentId,
      round,
      matchNumber,
      teamA,
      teamB,
      nextMatchId,
    } = req.body;

    const match = await matchService.createMatch({
      tournamentId,
      round: round as MatchRound,
      matchNumber: Number(matchNumber),
      teamA,
      teamB,
      ...(nextMatchId !== undefined ? { nextMatchId } : {}),
    });

    return res.status(201).json({
      success: true,
      message: "Match scheduled successfully.",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matchId = req.params.matchId as string;

    const {
      scoreA,
      scoreB,
      currentSet,
      status,
      winner,
    } = req.body;

    const updateData: {
      scoreA?: number;
      scoreB?: number;
      currentSet?: number;
      status?: MatchStatus;
      winner?: string;
    } = {};

    if (scoreA !== undefined) {
      updateData.scoreA = Number(scoreA);
    }

    if (scoreB !== undefined) {
      updateData.scoreB = Number(scoreB);
    }

    if (currentSet !== undefined) {
      updateData.currentSet = Number(currentSet);
    }

    if (status !== undefined) {
      updateData.status = status as MatchStatus;
    }

    if (winner !== undefined) {
      updateData.winner = winner;
    }

    const match = await matchService.updateScore(
      matchId,
      updateData
    );

    return res.status(200).json({
      success: true,
      message: "Live scorecard updated.",
      data: match,
    });
  } catch (error: any) {
    if (error.message === "Match not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Match has already been completed." ||
      error.message ===
        "A winner is required when completing a match." ||
      error.message ===
        "Both players must be assigned before completing a match." ||
      error.message ===
        "Winner must be a real player in the match." ||
      error.message ===
        "Winner must be one of the teams in the match." ||
      error.message ===
        "BYE matches are completed automatically and cannot be scored manually." ||
      error.message ===
        "Next match could not be found for winner advancement." ||
      error.message ===
        "Next match already has two teams assigned." ||
      error.message ===
        "Tournament not found for match." ||
      error.message ===
        "Matches cannot be updated after the tournament has ended."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getMatchDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matchId = req.params.matchId as string;

    const match = await matchService.getMatchDetails(matchId);

    return res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    if (error.message === "Match not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getTournamentMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tournamentId = req.params.tournamentId as string;

    const matches =
      await matchService.getTournamentMatches(tournamentId);

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};
