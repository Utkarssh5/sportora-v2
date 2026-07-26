import type { ITournament } from '../models/tournament.model.js';

export interface AIRiskResult {
  riskScore: number;
  analysis: string;
  requiresManualReview: boolean;
}

export class AIPrescreenerService {
  public static async analyzeTournamentProposal(
    tournamentData: Partial<ITournament>
  ): Promise<AIRiskResult> {
    let riskScore = 0;
    const flags: string[] = [];

    if (!tournamentData.venueVideos || tournamentData.venueVideos.length === 0) {
      riskScore += 35;
      flags.push('High Risk: Missing ground/venue video proof.');
    }

    if (!tournamentData.venuePhotos || tournamentData.venuePhotos.length < 2) {
      riskScore += 15;
      flags.push('Low Risk: Insufficient venue photos (requires at least 2).');
    }

    if (!tournamentData.permissionDocs || tournamentData.permissionDocs.length === 0) {
      riskScore += 25;
      flags.push('Medium Risk: No stadium/authority NOC permission document attached.');
    }

    if (tournamentData.entryFee && tournamentData.prizePool && tournamentData.maxParticipants) {
      const estimatedCollectable = tournamentData.entryFee * tournamentData.maxParticipants;
      if (tournamentData.prizePool > estimatedCollectable * 5) {
        riskScore += 40;
        flags.push('Critical Risk: Suspiciously high prize pool relative to maximum entry fee capacity.');
      }
    }

    let analysis = 'All venue proofs and financial parameters verified as standard.';
    if (flags.length > 0) {
      analysis = `AI Risk Flags Detected:\n- ${flags.join('\n- ')}`;
    }

    riskScore = Math.min(riskScore, 100);

    return {
      riskScore,
      analysis,
      requiresManualReview: riskScore >= 30,
    };
  }
}
