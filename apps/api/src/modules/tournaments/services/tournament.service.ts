import { tournamentRepository } from "../repositories/tournament.repository.js";

import { organizerVerificationService } from "../../organizerVerification/services/organizerVerification.service.js";

import { AIPrescreenerService } from "../../../ai/prescreener.service.js";

import { TournamentStatus } from "../models/tournament.model.js";
import type { ITournament } from "../models/tournament.model.js";


class TournamentService {

  async createTournament(
    data: Partial<ITournament>,
    user: {
      id: string;
      role: string;
    }
  ) {

    if (user.role === "ORGANIZER") {

      const approved =
        await organizerVerificationService.isOrganizerApproved(
          user.id
        );

      if (!approved) {
        throw new Error(
          "Organizer verification is required before creating tournaments."
        );
      }
    }

    const aiAnalysis =
      await AIPrescreenerService.analyzeTournamentProposal(data);

    const tournament =
      await tournamentRepository.create({
        ...data,
        organizerId: user.id as any,
        aiRiskScore: aiAnalysis.riskScore,
        aiRiskAnalysis: aiAnalysis.analysis,
      });

    return {
      tournament,
      aiScreening: aiAnalysis,
    };
  }


  async getTournaments(
    filter: Record<string, unknown>,
    page: number,
    limit: number
  ) {

    const skip = (page - 1) * limit;

    const tournaments =
      await tournamentRepository.findAll(
        filter,
        skip,
        limit
      );

    const total =
      await tournamentRepository.count(filter);

    return {
      tournaments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async getTournamentById(id: string) {
    return await tournamentRepository.findById(id);
  }


  async updateTournament(
    id: string,
    data: Partial<ITournament>,
    user: {
      id: string;
      role: string;
    }
  ) {

    const tournament =
      await tournamentRepository.findById(id);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to update this tournament."
      );
    }

    const updateData = { ...data } as Record<string, unknown>;

    // Organizer must not modify protected fields.
    if (!isAdmin) {
      delete updateData.organizerId;
      delete updateData.status;
      delete updateData.aiRiskScore;
      delete updateData.aiRiskAnalysis;
    }

    return await tournamentRepository.update(
      id,
      updateData as Partial<ITournament>
    );
  }


  async deleteTournament(
    id: string,
    user: {
      id: string;
      role: string;
    }
  ) {

    const tournament =
      await tournamentRepository.findById(id);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to delete this tournament."
      );
    }

    return await tournamentRepository.delete(id);
  }


  async approveTournament(id: string) {

    const tournament =
      await tournamentRepository.findById(id);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== TournamentStatus.PENDING_APPROVAL) {
      throw new Error(
        "Only pending tournaments can be approved."
      );
    }

    return await tournamentRepository.update(id, {
      status: TournamentStatus.APPROVED,
    });
  }


  async rejectTournament(id: string) {

    const tournament =
      await tournamentRepository.findById(id);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== TournamentStatus.PENDING_APPROVAL) {
      throw new Error(
        "Only pending tournaments can be rejected."
      );
    }

    return await tournamentRepository.update(id, {
      status: TournamentStatus.CANCELLED,
    });
  }

}


export const tournamentService =
  new TournamentService();
