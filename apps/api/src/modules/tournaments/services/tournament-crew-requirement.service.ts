import { tournamentRepository } from "../repositories/tournament.repository.js";
import {
  TournamentStatus,
} from "../models/tournament.model.js";
import {
  tournamentCrewRequirementRepository,
} from "../repositories/tournament-crew-requirement.repository.js";

class TournamentCrewRequirementService {
  async createRequirement(
    tournamentId: string,
    data: {
      role: string;
      quantity: number;
    },
    user: {
      id: string;
      role: string;
    }
  ) {
    const tournament =
      await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to manage crew requirements for this tournament."
      );
    }

    if (
      tournament.status === TournamentStatus.COMPLETED ||
      tournament.status === TournamentStatus.CANCELLED
    ) {
      throw new Error(
        "Crew requirements cannot be added to a completed or cancelled tournament."
      );
    }

    const role = data.role?.trim();

    if (!role) {
      throw new Error("Crew role is required.");
    }

    if (
      !Number.isInteger(data.quantity) ||
      data.quantity < 1
    ) {
      throw new Error(
        "Crew quantity must be a whole number greater than 0."
      );
    }

    return tournamentCrewRequirementRepository.create({
      tournamentId,
      role,
      quantity: data.quantity,
    });
  }


  async getRequirements(
    tournamentId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const tournament =
      await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to view crew requirements for this tournament."
      );
    }

    return tournamentCrewRequirementRepository
      .findByTournament(tournamentId);
  }
}

export const tournamentCrewRequirementService =
  new TournamentCrewRequirementService();
