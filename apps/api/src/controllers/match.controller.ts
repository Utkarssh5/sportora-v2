import type { Request, Response } from 'express';
import { MatchModel, MatchStatus } from '../models/match.model.js';

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { tournamentId, teamA, teamB } = req.body;
    const match = await MatchModel.create({ tournamentId, teamA, teamB });

    res.status(201).json({
      success: true,
      message: 'Match scheduled successfully.',
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateScore = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const { scoreA, scoreB, currentSet, status, winner } = req.body;

    const match = await MatchModel.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    if (scoreA !== undefined) match.scoreA = scoreA;
    if (scoreB !== undefined) match.scoreB = scoreB;
    if (currentSet !== undefined) match.currentSet = currentSet;
    if (status) match.status = status;
    if (winner) match.winner = winner;

    await match.save();

    res.status(200).json({
      success: true,
      message: 'Live scorecard updated.',
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const match = await MatchModel.findById(matchId);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
