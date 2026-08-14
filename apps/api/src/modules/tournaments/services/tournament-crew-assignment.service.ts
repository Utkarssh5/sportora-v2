import { tournamentRepository } from "../repositories/tournament.repository.js";
import {
  tournamentCrewAssignmentRepository,
} from "../repositories/tournament-crew-assignment.repository.js";
import { CrewModel } from "../../crew/models/crew.model.js";
import { TournamentStatus } from "../models/tournament.model.js";

class TournamentCrewAssignmentService {
  async assignCrew(
    tournamentId: string,
    crewId: string,
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
        "You do not have permission to assign crew to this tournament."
      );
    }

    if (tournament.status !== TournamentStatus.APPROVED) {
      throw new Error(
        "Crew can only be assigned to an approved tournament."
      );
    }

    const crew = await CrewModel.findById(crewId);

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (!crew.isAvailable) {
      throw new Error("Crew member is not available.");
    }

    const existing =
      await tournamentCrewAssignmentRepository
        .findByTournamentAndCrew(
          tournamentId,
          crewId
        );

    if (existing) {
      throw new Error(
        "This crew member is already assigned to the tournament."
      );
    }

    return tournamentCrewAssignmentRepository.create(
      tournamentId,
      crewId
    );
  }

  async getTournamentCrew(
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
        "You do not have permission to view this tournament's crew."
      );
    }

    return tournamentCrewAssignmentRepository
      .findByTournament(tournamentId);
  }
}

export const tournamentCrewAssignmentService =
  new TournamentCrewAssignmentService();
