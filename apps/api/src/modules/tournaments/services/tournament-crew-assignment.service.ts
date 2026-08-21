import { tournamentRepository } from "../repositories/tournament.repository.js";
import {
  tournamentCrewAssignmentRepository,
} from "../repositories/tournament-crew-assignment.repository.js";
import {
  tournamentCrewRequirementRepository,
} from "../repositories/tournament-crew-requirement.repository.js";
import { CrewModel } from "../../crew/models/crew.model.js";
import {
  tournamentRegistrationRepository,
} from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";
import { TournamentStatus } from "../models/tournament.model.js";
import { groundCrewAchievementService } from "../../crewAchievements/services/ground-crew-achievement.service.js";
import { crewSettlementService } from "../../crewSettlement/services/crew-settlement.service.js";

class TournamentCrewAssignmentService {
  private async hasPlayerDateConflict(
    userId: string,
    crewTournamentStartDate: Date,
    crewTournamentEndDate: Date
  ) {
    const registrations =
      await tournamentRegistrationRepository
        .findRegisteredByUserWithTournaments(userId);

    return registrations.some((registration: any) => {
      const playerTournament = registration.tournamentId;

      if (
        !playerTournament ||
        !playerTournament.startDate ||
        !playerTournament.endDate
      ) {
        return false;
      }

      const playerStart = new Date(playerTournament.startDate);
      const playerEnd = new Date(playerTournament.endDate);
      const crewStart = new Date(crewTournamentStartDate);
      const crewEnd = new Date(crewTournamentEndDate);

      return (
        crewStart <= playerEnd &&
        crewEnd >= playerStart
      );
    });
  }

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

    if (
      crew.userId.toString() ===
      tournament.organizerId.toString()
    ) {
      throw new Error(
        "Tournament owner cannot work as Crew in their own tournament."
      );
    }

    if (!crew.isAvailable) {
      throw new Error("Crew member is not available.");
    }

    const hasPlayerConflict =
      await this.hasPlayerDateConflict(
        crew.userId.toString(),
        tournament.startDate,
        tournament.endDate
      );

    if (hasPlayerConflict) {
      throw new Error(
        "Crew member is already registered as a player in a tournament with overlapping dates."
      );
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
      crewId,
      {
        eventDate: tournament.startDate,
      }
    );
  }

  async startWork(
    assignmentId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const assignment =
      await tournamentCrewAssignmentRepository.findById(
        assignmentId
      );

    if (!assignment) {
      throw new Error("Crew assignment not found.");
    }

    const crew =
      await CrewModel.findById(assignment.crewId);

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (crew.userId.toString() !== user.id) {
      throw new Error(
        "You do not have permission to start this crew assignment."
      );
    }

    if (
      assignment.status !==
      "ASSIGNED"
    ) {
      throw new Error(
        "This crew assignment cannot be started from its current status."
      );
    }

    return tournamentCrewAssignmentRepository.updateStatus(
      assignmentId,
      {
        status: "WORKING",
        workStartedAt: new Date(),
      }
    );
  }

  async submitCompletion(
    assignmentId: string,
    data: {
      completionProof?: string[];
      completionNote?: string;
    },
    user: {
      id: string;
      role: string;
    }
  ) {
    const assignment =
      await tournamentCrewAssignmentRepository.findById(
        assignmentId
      );

    if (!assignment) {
      throw new Error("Crew assignment not found.");
    }

    const crew =
      await CrewModel.findById(assignment.crewId);

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (crew.userId.toString() !== user.id) {
      throw new Error(
        "You do not have permission to submit completion for this assignment."
      );
    }

    if (
      assignment.status !==
      "WORKING"
    ) {
      throw new Error(
        "Work completion can only be submitted for an active assignment."
      );
    }

    const proof = Array.isArray(data.completionProof)
      ? data.completionProof.filter(
          (item) =>
            typeof item === "string" &&
            item.trim().length > 0
        )
      : [];

    if (proof.length === 0) {
      throw new Error(
        "Please attach at least one completion proof before submitting your work."
      );
    }

    const completionNote =
      data.completionNote?.trim();

    return tournamentCrewAssignmentRepository.updateStatus(
      assignmentId,
      {
        status: "COMPLETION_SUBMITTED",
        workCompletedAt: new Date(),
        completionProof: proof,
        completionNote,
      }
    );
  }

  async verifyCompletion(
    assignmentId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const assignment =
      await tournamentCrewAssignmentRepository.findById(
        assignmentId
      );

    if (!assignment) {
      throw new Error("Crew assignment not found.");
    }

    const tournament =
      await tournamentRepository.findById(
        assignment.tournamentId.toString()
      );

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to verify this crew assignment."
      );
    }

    if (
      assignment.status !==
      "COMPLETION_SUBMITTED"
    ) {
      throw new Error(
        "Only submitted crew work can be verified."
      );
    }

    const verifiedAt = new Date();

    const updatedAssignment =
      await tournamentCrewAssignmentRepository.updateStatus(
        assignmentId,
        {
          status: "PAYOUT_PENDING",
          verifiedAt,
          verifiedBy: user.id,
        }
      );

    const crew = await CrewModel.findById(
      assignment.crewId.toString()
    );

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    await crewSettlementService.createForVerifiedAssignment({
      assignmentId: assignment._id.toString(),
      tournamentId: tournament._id.toString(),
      crewId: crew._id.toString(),
      ...(assignment.agreedPayoutAmount !== undefined
        ? { amount: assignment.agreedPayoutAmount }
        : {}),
      verifiedAt,
    });

    await groundCrewAchievementService.createForVerifiedAssignment({
      userId: crew.userId.toString(),
      assignmentId: assignment._id.toString(),
      tournamentId: tournament._id.toString(),
      crewId: crew._id.toString(),
      role: crew.role,
      sport: tournament.sport,
      tournamentTitle: tournament.title,
      eventDate: assignment.eventDate,
      city: tournament.city,
      state: tournament.state,
      verifiedAt,
    });

    return updatedAssignment;
  }

  async findCrewCandidates(
    tournamentId: string,
    requirementId: string,
    user: { id: string; role: string }
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
        "You do not have permission to find crew for this tournament."
      );
    }

    const requirement =
      await tournamentCrewRequirementRepository.findById(
        requirementId
      );

    if (!requirement) {
      throw new Error("Crew requirement not found.");
    }

    if (
      requirement.tournamentId.toString() !==
      tournamentId
    ) {
      throw new Error(
        "Crew requirement does not belong to this tournament."
      );
    }

    if (
      requirement.status === "CANCELLED" ||
      requirement.filledQuantity >= requirement.quantity
    ) {
      return [];
    }

    const candidates = await CrewModel.find({
      role: requirement.role.trim().toUpperCase(),
      sportsExpertise: tournament.sport,
      isAvailable: true,
    }).sort({
      rating: -1,
      experienceYears: -1,
      fullName: 1,
    });

    const result = [];

    for (const crew of candidates) {
      // Tournament owner cannot work as crew in their own tournament.
      if (crew.userId.toString() === tournament.organizerId.toString()) {
        continue;
      }

      const hasPlayerConflict =
        await this.hasPlayerDateConflict(
          crew.userId.toString(),
          tournament.startDate,
          tournament.endDate
        );

      if (hasPlayerConflict) {
        continue;
      }

      const existingAssignment =
        await tournamentCrewAssignmentRepository
          .findByTournamentAndCrew(
            tournamentId,
            crew._id.toString()
          );

      if (existingAssignment) {
        continue;
      }

      result.push({
        id: crew._id,
        fullName: crew.fullName,
        role: crew.role,
        sportsExpertise: crew.sportsExpertise,
        skills: crew.skills,
        city: crew.city,
        state: crew.state,
        experienceYears: crew.experienceYears,
        rating: crew.rating,
        isAvailable: crew.isAvailable,
      });
    }

    return result;
  }

  async assignCrewToRequirement(
    tournamentId: string,
    requirementId: string,
    crewId: string,
    user: { id: string; role: string; }
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

    const requirement =
      await tournamentCrewRequirementRepository.findById(
        requirementId
      );

    if (!requirement) {
      throw new Error("Crew requirement not found.");
    }

    if (
      requirement.tournamentId.toString() !==
      tournamentId
    ) {
      throw new Error(
        "Crew requirement does not belong to this tournament."
      );
    }

    if (requirement.status === "CANCELLED") {
      throw new Error(
        "This crew requirement has been cancelled."
      );
    }

    if (
      requirement.filledQuantity >=
      requirement.quantity
    ) {
      throw new Error(
        "This crew requirement is already filled."
      );
    }

    const crew =
      await CrewModel.findById(crewId);

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (!crew.isAvailable) {
      throw new Error("Crew member is not available.");
    }

    const hasPlayerConflict =
      await this.hasPlayerDateConflict(
        crew.userId.toString(),
        tournament.startDate,
        tournament.endDate
      );

    if (hasPlayerConflict) {
      throw new Error(
        "Crew member is already registered as a player in a tournament with overlapping dates."
      );
    }

    if (
      crew.role.toString().trim().toUpperCase() !==
      requirement.role.trim().toUpperCase()
    ) {
      throw new Error(
        "Crew member role does not match the crew requirement."
      );
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

    const assignment =
      await tournamentCrewAssignmentRepository.create(
        tournamentId,
        crewId,
        {
          requirementId,
          eventDate: tournament.startDate,
        }
      );

    await tournamentCrewRequirementRepository
      .incrementFilledQuantity(requirementId);

    return assignment;
  }

  async getMyAssignments(
    user: {
      id: string;
      role: string;
    }
  ) {
    const crew = await CrewModel.findOne({
      userId: user.id,
    });

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return tournamentCrewAssignmentRepository.findByCrewId(
      crew._id.toString()
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
