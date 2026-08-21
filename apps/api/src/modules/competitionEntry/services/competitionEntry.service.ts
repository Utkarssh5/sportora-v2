import type { ClientSession } from "mongoose";

import {
  CompetitionEntryStatus,
  CompetitionParticipantRole,
} from "../models/competitionEntry.model.js";
import { competitionEntryRepository } from "../repositories/competitionEntry.repository.js";
import { TournamentModel } from "../../tournaments/models/tournament.model.js";
import { User } from "../../users/models/user.model.js";

type ParticipantInput = {
  userId: string;
  role?: CompetitionParticipantRole;
};

export class CompetitionEntryService {
  private async getTournament(
    tournamentId: string
  ) {
    const tournament =
      await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found.");
    }

    return tournament;
  }

  private resolveCompetitionType(
    tournament: {
      competitionType?: string;
      type?: string;
    }
  ) {
    return (
      tournament.competitionType ??
      (
        tournament.type === "SOLO"
          ? "SINGLES"
          : tournament.type === "DUO"
            ? "DOUBLES"
            : "TEAM"
      )
    );
  }

  private getRules(
    tournament: {
      competitionRules?: {
        participantCount: number;
        requiresRoster: boolean;
        defaultPlayingSize?: number;
        allowsSubstitutes?: boolean;
        requiresMixedGender?: boolean;
      };
    }
  ) {
    return tournament.competitionRules;
  }

  async ensureForRegistration(
    data: {
      tournamentId: string;
      registrationId: string;
      captainId: string;
      competitionType: string;
    },
    session?: ClientSession
  ) {
    const existing =
      await competitionEntryRepository.findByRegistrationId(
        data.registrationId,
        session
      );

    if (existing) {
      return existing;
    }

    const isSingles =
      data.competitionType === "SINGLES";

    return competitionEntryRepository.create(
      {
        tournamentId: data.tournamentId,
        registrationId: data.registrationId,
        captainId: data.captainId,
        competitionType: data.competitionType,
        participants: [
          {
            userId: data.captainId,
            role: CompetitionParticipantRole.CAPTAIN,
          },
        ],
        status: isSingles
          ? CompetitionEntryStatus.APPROVED
          : CompetitionEntryStatus.PENDING_DETAILS,
        ...(isSingles
          ? {
              submittedAt: new Date(),
              approvedAt: new Date(),
            }
          : {}),
      },
      session
    );
  }

  async getByRegistrationId(
    registrationId: string
  ) {
    return competitionEntryRepository.findByRegistrationId(
      registrationId
    );
  }

  async getTournamentEntries(
    tournamentId: string
  ) {
    return competitionEntryRepository.findByTournament(
      tournamentId
    );
  }

  async getApprovedTournamentEntries(
    tournamentId: string
  ) {
    return competitionEntryRepository.findApprovedByTournament(
      tournamentId
    );
  }

  private async saveParticipationDetails(
    registrationId: string,
    userId: string,
    data: {
      displayName?: string;
      participants: ParticipantInput[];
      teamSheetUrl?: string;
    },
    finalize: boolean
  ) {
    const entry =
      await competitionEntryRepository.findByRegistrationId(
        registrationId
      );

    if (!entry) {
      throw new Error(
        "Competition entry not found."
      );
    }

    if (
      entry.captainId.toString() !== userId
    ) {
      throw new Error(
        "Only the registration captain can update participation details."
      );
    }

    if (
      entry.status === CompetitionEntryStatus.APPROVED
    ) {
      throw new Error(
        "Participation details are already approved."
      );
    }

    const tournament =
      await this.getTournament(
        entry.tournamentId.toString()
      );

    if (
      new Date() >
      tournament.registrationDeadline
    ) {
      throw new Error(
        "Registration deadline has passed. Participation details are locked."
      );
    }

    const rules =
      this.getRules(tournament);

    const competitionType =
      this.resolveCompetitionType(tournament);

    const normalizedParticipants =
      data.participants.map((participant) => ({
        userId: participant.userId,
        role:
          participant.userId === userId
            ? CompetitionParticipantRole.CAPTAIN
            : (
                participant.role ??
                CompetitionParticipantRole.PLAYER
              ),
      }));

    const uniqueUserIds =
      new Set(
        normalizedParticipants.map(
          (participant) => participant.userId
        )
      );

    if (
      uniqueUserIds.size !==
      normalizedParticipants.length
    ) {
      throw new Error(
        "A player cannot appear more than once in the same entry."
      );
    }

    if (!uniqueUserIds.has(userId)) {
      throw new Error(
        "Captain must be included in the participation list."
      );
    }

    const captainCount =
      normalizedParticipants.filter(
        (participant) =>
          participant.role ===
          CompetitionParticipantRole.CAPTAIN
      ).length;

    if (captainCount !== 1) {
      throw new Error(
        "Exactly one captain is required."
      );
    }

    if (competitionType === "SINGLES") {
      if (normalizedParticipants.length !== 1) {
        throw new Error(
          "Singles requires exactly one player."
        );
      }
    }

    if (
      competitionType === "DOUBLES" ||
      competitionType === "MIXED_DOUBLES"
    ) {
      if (
        finalize &&
        normalizedParticipants.length !== 2
      ) {
        throw new Error(
          `${competitionType} requires exactly two players before final submission.`
        );
      }

      if (
        !finalize &&
        normalizedParticipants.length > 2
      ) {
        throw new Error(
          `${competitionType} can contain at most two players.`
        );
      }
    }

    if (
      competitionType === "TEAM" ||
      competitionType === "RELAY"
    ) {
      const minimumPlayers =
        rules?.defaultPlayingSize ?? 1;

      const regularPlayers =
        normalizedParticipants.filter(
          (participant) =>
            participant.role !==
            CompetitionParticipantRole.SUBSTITUTE
        );

      if (
        finalize &&
        regularPlayers.length < minimumPlayers
      ) {
        throw new Error(
          `This ${competitionType.toLowerCase()} entry requires at least ${minimumPlayers} playing participants before final submission.`
        );
      }

      if (
        !rules?.allowsSubstitutes &&
        normalizedParticipants.some(
          (participant) =>
            participant.role ===
            CompetitionParticipantRole.SUBSTITUTE
        )
      ) {
        throw new Error(
          "Substitutes are not allowed for this competition."
        );
      }
    }

    const participantUsers =
      await User.find({
        _id: {
          $in: Array.from(uniqueUserIds),
        },
      }).select("_id");

    if (
      participantUsers.length !==
      uniqueUserIds.size
    ) {
      throw new Error(
        "One or more selected players do not exist."
      );
    }

    const conflictingEntries =
      await competitionEntryRepository.findByTournament(
        entry.tournamentId.toString()
      );

    const otherEntries =
      conflictingEntries.filter(
        (otherEntry) =>
          otherEntry._id.toString() !==
          entry._id.toString()
      );

    const conflictingUserId =
      otherEntries
        .flatMap(
          (otherEntry) =>
            otherEntry.participants.map(
              (participant) =>
                participant.userId.toString()
            )
        )
        .find((participantId) =>
          uniqueUserIds.has(participantId)
        );

    if (conflictingUserId) {
      throw new Error(
        "One or more selected players are already part of another entry in this tournament."
      );
    }

    const displayName =
      data.displayName?.trim();

    if (displayName) {
      entry.displayName = displayName;
    } else {
      delete entry.displayName;
    }

    entry.participants =
      normalizedParticipants.map(
        (participant) => ({
          userId: participant.userId as any,
          role: participant.role,
        })
      );

    if (data.teamSheetUrl !== undefined) {
      const teamSheetUrl =
        data.teamSheetUrl.trim();

      if (teamSheetUrl) {
        entry.teamSheetUrl = teamSheetUrl;
      } else {
        delete entry.teamSheetUrl;
      }
    }

    if (finalize) {
      entry.status =
        CompetitionEntryStatus.SUBMITTED;
      entry.submittedAt =
        new Date();
    } else {
      entry.status =
        CompetitionEntryStatus.PENDING_DETAILS;
      delete entry.submittedAt;
    }

    delete entry.rejectionReason;

    return competitionEntryRepository.update(
      entry
    );
  }

  async saveDraft(
    registrationId: string,
    userId: string,
    data: {
      displayName?: string;
      participants: ParticipantInput[];
      teamSheetUrl?: string;
    }
  ) {
    return this.saveParticipationDetails(
      registrationId,
      userId,
      data,
      false
    );
  }

  async submitDetails(
    registrationId: string,
    userId: string,
    data: {
      displayName?: string;
      participants: ParticipantInput[];
      teamSheetUrl?: string;
    }
  ) {
    return this.saveParticipationDetails(
      registrationId,
      userId,
      data,
      true
    );
  }


  private async assertOrganizerAccess(
    tournamentId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const tournament =
      await this.getTournament(tournamentId);

    const isAdmin =
      user.role === "ADMIN";

    const isOrganizer =
      user.role === "ORGANIZER" &&
      tournament.organizerId.toString() === user.id;

    if (!isAdmin && !isOrganizer) {
      throw new Error(
        "You do not have permission to review this competition entry."
      );
    }

    return tournament;
  }

  async approveEntry(
    entryId: string,
    user: {
      id: string;
      role: string;
    }
  ) {
    const entry =
      await competitionEntryRepository.findById(
        entryId
      );

    if (!entry) {
      throw new Error(
        "Competition entry not found."
      );
    }

    await this.assertOrganizerAccess(
      entry.tournamentId.toString(),
      user
    );

    if (
      entry.status !==
      CompetitionEntryStatus.SUBMITTED
    ) {
      throw new Error(
        "Only submitted competition entries can be approved."
      );
    }

    entry.status =
      CompetitionEntryStatus.APPROVED;

    entry.approvedAt =
      new Date();

    delete entry.rejectionReason;

    return competitionEntryRepository.update(
      entry
    );
  }

  async rejectEntry(
    entryId: string,
    user: {
      id: string;
      role: string;
    },
    rejectionReason: string
  ) {
    const entry =
      await competitionEntryRepository.findById(
        entryId
      );

    if (!entry) {
      throw new Error(
        "Competition entry not found."
      );
    }

    await this.assertOrganizerAccess(
      entry.tournamentId.toString(),
      user
    );

    if (
      entry.status !==
      CompetitionEntryStatus.SUBMITTED
    ) {
      throw new Error(
        "Only submitted competition entries can be rejected."
      );
    }

    const reason =
      rejectionReason?.trim();

    if (!reason) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    entry.status =
      CompetitionEntryStatus.REJECTED;

    entry.rejectionReason =
      reason;

    delete entry.approvedAt;

    return competitionEntryRepository.update(
      entry
    );
  }
}

export const competitionEntryService =
  new CompetitionEntryService();
