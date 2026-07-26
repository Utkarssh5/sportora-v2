import { Router } from 'express';
import type { Request, Response } from 'express';
import { TournamentModel } from '../models/tournament.model.js';
import { AIPrescreenerService } from '../ai/prescreener.service.js';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const tournamentData = req.body;
    const aiAnalysis = await AIPrescreenerService.analyzeTournamentProposal(tournamentData);

    const tournament = await TournamentModel.create({
      ...tournamentData,
      aiRiskScore: aiAnalysis.riskScore,
      aiRiskAnalysis: aiAnalysis.analysis,
    });

    res.status(201).json({
      success: true,
      message: 'Tournament proposal submitted for Admin review.',
      data: {
        tournament,
        aiScreening: aiAnalysis,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
