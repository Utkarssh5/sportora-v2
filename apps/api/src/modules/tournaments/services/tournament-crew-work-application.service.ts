import {
  tournamentCrewWorkOpportunityRepository,
} from "../repositories/tournament-crew-work-opportunity.repository.js";

import {
  tournamentCrewWorkApplicationRepository,
} from "../repositories/tournament-crew-work-application.repository.js";

import {
  TournamentCrewWorkApplicationStatus,
} from "../models/tournament-crew-work-application.model.js";

import {
  tournamentRepository,
} from "../repositories/tournament.repository.js";

import {
  crewRepository,
} from "../../crew/repositories/crew.repository.js";

import {
  tournamentCrewAssignmentRepository,
} from "../repositories/tournament-crew-assignment.repository.js";

import {
  tournamentCrewRequirementRepository,
} from "../repositories/tournament-crew-requirement.repository.js";

import {
  TournamentStatus,
} from "../models/tournament.model.js";
import {
  tournamentRegistrationRepository,
} from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";

import {
  TournamentCrewWorkOpportunityStatus,
} from "../models/tournament-crew-work-opportunity.model.js";

class TournamentCrewWorkApplicationService {
  async apply(
    opportunityId: string,
    data: {
      message?: string;
    },
    user: {
      id: string;
      role: string;
    }
  ) {
    const opportunity =
      await tournamentCrewWorkOpportunityRepository.findById(
        opportunityId
      );

    if (!opportunity) {
      throw new Error("Crew work opportunity not found.");
    }

    if (
      opportunity.status !==
      TournamentCrewWorkOpportunityStatus.OPEN
    ) {
      throw new Error(
        "This crew work opportunity is no longer open."
      );
    }

    if (
      opportunity.filledQuantity >=
      opportunity.quantity
    ) {
      throw new Error(
        "All positions for this opportunity have already been filled."
      );
    }

    const tournament =
      await tournamentRepository.findById(
        opportunity.tournamentId.toString()
      );

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const crew =
      await crewRepository.findByUserId(user.id);

    if (!crew) {
      throw new Error(
        "Ground Crew profile not found. Please complete your Ground Crew profile before applying."
      );
    }

    if (!crew.isAvailable) {
      throw new Error(
        "Your Ground Crew profile is currently unavailable."
      );
    }

    const playerRegistrations =
      await tournamentRegistrationRepository
        .findRegisteredByUserWithTournaments(
          user.id
        );

    const playerConflict =
      playerRegistrations.find((registration: any) => {
        const playerTournament =
          registration.tournamentId;

        if (
          !playerTournament ||
          !playerTournament.startDate ||
          !playerTournament.endDate
        ) {
          return false;
        }

        const playerStart =
          new Date(playerTournament.startDate);

        const playerEnd =
          new Date(playerTournament.endDate);

        const crewStart =
          new Date(tournament.startDate);

        const crewEnd =
          new Date(tournament.endDate);

        return (
          crewStart <= playerEnd &&
          crewEnd >= playerStart
        );
      });

    if (playerConflict) {
      const conflictTournament =
        (playerConflict as any).tournamentId;

      const error = new Error(
        "You already have a tournament scheduled as a player on an overlapping date."
      ) as Error & {
        code?: string;
        conflictTournament?: unknown;
      };

      error.code = "SCHEDULE_CONFLICT";
      error.conflictTournament = {
        id: conflictTournament._id,
        title: conflictTournament.title,
        startDate: conflictTournament.startDate,
        endDate: conflictTournament.endDate,
        role: "PLAYER",
      };

      throw error;
    }

    const organizerTournaments =
      await tournamentRepository.findByOrganizer(
        user.id
      );

    const organizerConflict =
      organizerTournaments.find((organizedTournament: any) => {
        if (
          !organizedTournament.startDate ||
          !organizedTournament.endDate
        ) {
          return false;
        }

        if (
          organizedTournament.status ===
            TournamentStatus.COMPLETED ||
          organizedTournament.status ===
            TournamentStatus.CANCELLED
        ) {
          return false;
        }

        const organizerStart =
          new Date(organizedTournament.startDate);

        const organizerEnd =
          new Date(organizedTournament.endDate);

        const crewStart =
          new Date(tournament.startDate);

        const crewEnd =
          new Date(tournament.endDate);

        return (
          crewStart <= organizerEnd &&
          crewEnd >= organizerStart
        );
      });

    if (organizerConflict) {
      const error = new Error(
        "You already have a tournament scheduled as an organizer on an overlapping date."
      ) as Error & {
        code?: string;
        conflictTournament?: unknown;
      };

      error.code = "SCHEDULE_CONFLICT";
      error.conflictTournament = {
        id: organizerConflict._id,
        title: organizerConflict.title,
        startDate: organizerConflict.startDate,
        endDate: organizerConflict.endDate,
        role: "ORGANIZER",
      };

      throw error;
    }

    const existing =
      await tournamentCrewWorkApplicationRepository
        .findByOpportunityAndCrew(
          opportunityId,
          crew._id.toString()
        );

    if (existing) {
      if (
        existing.status ===
        TournamentCrewWorkApplicationStatus.WITHDRAWN
      ) {
        throw new Error(
          "You have already applied to this opportunity and cannot apply again."
        );
      }

      throw new Error(
        "You have already applied to this opportunity."
      );
    }

    const application =
      await tournamentCrewWorkApplicationRepository.create({
        opportunityId,
        tournamentId:
          opportunity.tournamentId.toString(),
        requirementId:
          opportunity.requirementId.toString(),
        crewId: crew._id.toString(),
        ...(data.message?.trim()
          ? { message: data.message.trim() }
          : {}),
      });

    return application;
  }

  async getMyApplications(
    user: {
      id: string;
      role: string;
    }
  ) {
    const crew =
      await crewRepository.findByUserId(user.id);

    if (!crew) {
      throw new Error("Ground Crew profile not found.");
    }

    return tournamentCrewWorkApplicationRepository
      .findByCrew(crew._id.toString());
  }

  async acceptApplication(
    applicationId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const application =
      await tournamentCrewWorkApplicationRepository
        .findById(applicationId);

    if (!application) {
      throw new Error(
        "Crew work application not found."
      );
    }

    if (
      application.status !==
      TournamentCrewWorkApplicationStatus.APPLIED
    ) {
      throw new Error(
        "This application has already been reviewed."
      );
    }

    const opportunity =
      await tournamentCrewWorkOpportunityRepository
        .findById(
          application.opportunityId.toString()
        );

    if (!opportunity) {
      throw new Error(
        "Crew work opportunity not found."
      );
    }

    if (
      opportunity.status !==
      TournamentCrewWorkOpportunityStatus.OPEN
    ) {
      throw new Error(
        "This crew work opportunity is no longer open."
      );
    }

    if (
      opportunity.filledQuantity >=
      opportunity.quantity
    ) {
      throw new Error(
        "All positions for this opportunity have already been filled."
      );
    }

    const tournament =
      await tournamentRepository.findById(
        application.tournamentId.toString()
      );

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to accept this application."
      );
    }

    if (
      tournament.status !==
      TournamentStatus.APPROVED
    ) {
      throw new Error(
        "Crew can only be assigned to an approved tournament."
      );
    }

    const requirement =
      await tournamentCrewRequirementRepository
        .findById(
          application.requirementId.toString()
        );

    if (!requirement) {
      throw new Error(
        "Crew requirement not found."
      );
    }

    if (
      requirement.tournamentId.toString() !==
      tournament._id.toString()
    ) {
      throw new Error(
        "Crew requirement does not belong to this tournament."
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
      await crewRepository.findById(
        application.crewId.toString()
      );

    if (!crew) {
      throw new Error(
        "Crew member not found."
      );
    }

    if (!crew.isAvailable) {
      throw new Error(
        "Crew member is not available."
      );
    }

    if (
      crew.userId.toString() ===
      tournament.organizerId.toString()
    ) {
      throw new Error(
        "Tournament owner cannot work as Crew in their own tournament."
      );
    }

    const playerRegistrations =
      await tournamentRegistrationRepository
        .findRegisteredByUserWithTournaments(
          crew.userId.toString()
        );

    const hasPlayerConflict =
      playerRegistrations.some((registration: any) => {
        const playerTournament =
          registration.tournamentId;

        if (
          !playerTournament ||
          !playerTournament.startDate ||
          !playerTournament.endDate
        ) {
          return false;
        }

        const playerStart =
          new Date(playerTournament.startDate);

        const playerEnd =
          new Date(playerTournament.endDate);

        const crewStart =
          new Date(tournament.startDate);

        const crewEnd =
          new Date(tournament.endDate);

        return (
          crewStart <= playerEnd &&
          crewEnd >= playerStart
        );
      });

    if (hasPlayerConflict) {
      throw new Error(
        "Crew member is already registered as a player in a tournament with overlapping dates."
      );
    }

    const organizerTournaments =
      await tournamentRepository.findByOrganizer(
        crew.userId.toString()
      );

    const hasOrganizerConflict =
      organizerTournaments.some((organizedTournament: any) => {
        if (
          !organizedTournament.startDate ||
          !organizedTournament.endDate
        ) {
          return false;
        }

        if (
          organizedTournament.status === TournamentStatus.COMPLETED ||
          organizedTournament.status === TournamentStatus.CANCELLED
        ) {
          return false;
        }

        const organizerStart =
          new Date(organizedTournament.startDate);

        const organizerEnd =
          new Date(organizedTournament.endDate);

        const crewStart =
          new Date(tournament.startDate);

        const crewEnd =
          new Date(tournament.endDate);

        return (
          crewStart <= organizerEnd &&
          crewEnd >= organizerStart
        );
      });

    if (hasOrganizerConflict) {
      throw new Error(
        "Crew member is already organizing a tournament with overlapping dates."
      );
    }

    const existingAssignment =
      await tournamentCrewAssignmentRepository
        .findByTournamentAndCrew(
          application.tournamentId.toString(),
          application.crewId.toString()
        );

    if (existingAssignment) {
      throw new Error(
        "This crew member is already assigned to the tournament."
      );
    }

    const assignment =
      await tournamentCrewAssignmentRepository.create(
        application.tournamentId.toString(),
        application.crewId.toString(),
        {
          requirementId:
            application.requirementId.toString(),
          eventDate: tournament.startDate,
          agreedPayoutAmount:
            opportunity.payoutAmount,
        }
      );

    await tournamentCrewRequirementRepository
      .incrementFilledQuantity(
        application.requirementId.toString()
      );

    await tournamentCrewWorkOpportunityRepository
      .incrementFilledQuantity(
        opportunity._id.toString()
      );

    const updatedApplication =
      await tournamentCrewWorkApplicationRepository
        .updateStatus(
          applicationId,
          TournamentCrewWorkApplicationStatus.ACCEPTED,
          user.id
        );

    return {
      application: updatedApplication,
      assignment,
      opportunity,
      crew,
    };
  }

  async getApplicationsForOpportunity(
    opportunityId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const opportunity =
      await tournamentCrewWorkOpportunityRepository.findById(
        opportunityId
      );

    if (!opportunity) {
      throw new Error(
        "Crew work opportunity not found."
      );
    }

    const tournament =
      await tournamentRepository.findById(
        opportunity.tournamentId.toString()
      );

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    const isAdmin = user.role === "ADMIN";

    const isOwner =
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "You do not have permission to view applications for this opportunity."
      );
    }

    return tournamentCrewWorkApplicationRepository
      .findByOpportunity(opportunityId);
  }
}

export const tournamentCrewWorkApplicationService =
  new TournamentCrewWorkApplicationService();
