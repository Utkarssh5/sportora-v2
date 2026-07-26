// Path: apps/api/src/routes/tournament.routes.ts
import { Router, Request, Response } from 'express';
import { TournamentModel } from '../models/tournament.model';
import { AIPrescreenerService } from '../ai/prescreener.service';

const router = Router();

// Proposal submission endpoint with integrated AI pre-screening
router.post('/create', async (req: Request, res: Response) => {
  try {
    const tournamentData = req.body;

    // Run Admin AI Pre-screener on proposal
    const aiAnalysis = await AIPrescreenerService.analyzeTournamentProposal(tournamentData);

    // Save tournament with AI Risk score attached
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