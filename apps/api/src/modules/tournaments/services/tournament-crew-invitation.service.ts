import { tournamentRepository } from "../repositories/tournament.repository.js";
import {
  tournamentCrewInvitationRepository,
} from "../repositories/tournament-crew-invitation.repository.js";
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
import {
  TournamentCrewInvitationStatus,
} from "../models/tournament-crew-invitation.model.js";

class TournamentCrewInvitationService {
  private async hasPlayerDateConflict(
    userId: string,
    tournamentStartDate: Date,
    tournamentEndDate: Date
  ) {
    const registrations =
      await tournamentRegistrationRepository
        .findRegisteredByUserWithTournaments(userId);

    return registrations.some((registration: any) => {
      const playerTournament = registration.tournamentId;

      if (
        !playerTournament?.startDate ||
        !playerTournament?.endDate
      ) {
        return false;
      }

      const playerStart =
        new Date(playerTournament.startDate);
      const playerEnd =
        new Date(playerTournament.endDate);

      const crewStart =
        new Date(tournamentStartDate);
      const crewEnd =
        new Date(tournamentEndDate);

      return (
        crewStart <= playerEnd &&
        crewEnd >= playerStart
      );
    });
  }

  private async validateInvitationTarget(
    tournamentId: string,
    requirementId: string,
    crewId: string
  ) {
    const tournament =
      await tournamentRepository.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    if (tournament.status !== TournamentStatus.APPROVED) {
      throw new Error(
        "Crew can only be invited to an approved tournament."
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

    const crew = await CrewModel.findById(crewId);

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (!crew.isAvailable) {
      throw new Error(
        "Crew member is not currently available."
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

    const existingAssignment =
      await tournamentCrewAssignmentRepository
        .findByTournamentAndCrew(
          tournamentId,
          crewId
        );

    if (existingAssignment) {
      throw new Error(
        "This crew member is already assigned to the tournament."
      );
    }

    return {
      tournament,
      requirement,
      crew,
    };
  }

  async inviteCrew(
    tournamentId: string,
    requirementId: string,
    crewId: string,
    message: string | undefined,
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
        "You do not have permission to invite crew to this tournament."
      );
    }

    const {
      requirement,
      crew,
    } = await this.validateInvitationTarget(
      tournamentId,
      requirementId,
      crewId
    );

    const existingInvitation =
      await tournamentCrewInvitationRepository
        .findByTournamentRequirementCrew(
          tournamentId,
          requirementId,
          crewId
        );

    if (existingInvitation) {
      throw new Error(
        existingInvitation.status ===
          TournamentCrewInvitationStatus.ACCEPTED
          ? "This crew member is already assigned through an accepted invitation."
          : "An active invitation already exists for this crew member."
      );
    }

    return tournamentCrewInvitationRepository.create({
      tournamentId,
      requirementId,
      crewId,
      invitedBy: user.id,
      eventDate: tournament.startDate,
      ...(message?.trim() ? { message: message.trim() } : {}),
    });
  }

  async getMyInvitations(user: {
    id: string;
    role: string;
  }) {
    const crew = await CrewModel.findOne({
      userId: user.id,
    });

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return tournamentCrewInvitationRepository
      .findByCrewId(crew._id.toString());
  }

  async respondToInvitation(
    invitationId: string,
    response: "ACCEPTED" | "DECLINED",
    user: {
      id: string;
      role: string;
    }
  ) {
    const invitation =
      await tournamentCrewInvitationRepository
        .findById(invitationId);

    if (!invitation) {
      throw new Error("Crew invitation not found.");
    }

    if (
      invitation.status !==
      TournamentCrewInvitationStatus.INVITED
    ) {
      throw new Error(
        "This invitation has already been responded to."
      );
    }

    const crew = await CrewModel.findById(
      invitation.crewId
    );

    if (!crew) {
      throw new Error("Crew member not found.");
    }

    if (crew.userId.toString() !== user.id) {
      throw new Error(
        "You do not have permission to respond to this invitation."
      );
    }

    if (response === "DECLINED") {
      return tournamentCrewInvitationRepository
        .updateStatus(
          invitationId,
          TournamentCrewInvitationStatus.DECLINED
        );
    }

    const {
      requirement,
      crew: currentCrew,
    } = await this.validateInvitationTarget(
      invitation.tournamentId.toString(),
      invitation.requirementId.toString(),
      invitation.crewId.toString()
    );

    const existingAssignment =
      await tournamentCrewAssignmentRepository
        .findByTournamentAndCrew(
          invitation.tournamentId.toString(),
          invitation.crewId.toString()
        );

    if (existingAssignment) {
      throw new Error(
        "This crew member is already assigned to the tournament."
      );
    }

    const assignment =
      await tournamentCrewAssignmentRepository.create(
        invitation.tournamentId.toString(),
        invitation.crewId.toString(),
        {
          requirementId:
            invitation.requirementId.toString(),
          eventDate: invitation.eventDate,
        }
      );

    await tournamentCrewRequirementRepository
      .incrementFilledQuantity(
        requirement._id.toString()
      );

    const updatedInvitation =
      await tournamentCrewInvitationRepository
        .updateStatus(
          invitationId,
          TournamentCrewInvitationStatus.ACCEPTED
        );

    return {
      invitation: updatedInvitation,
      assignment,
      crew: currentCrew,
    };
  }

  async getTournamentInvitations(
    tournamentId: string,
    requirementId: string | undefined,
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
        "You do not have permission to view this tournament's crew invitations."
      );
    }

    return tournamentCrewInvitationRepository
      .findByTournament(
        tournamentId,
        requirementId
      );
  }
}

export const tournamentCrewInvitationService =
  new TournamentCrewInvitationService();
