import { tournamentRepository } from "../repositories/tournament.repository.js";

import { organizerVerificationService } from "../../organizerVerification/services/organizerVerification.service.js";
import { venueVerificationService } from "../../venueVerification/services/venueVerification.service.js";

import { AIPrescreenerService } from "../../../ai/prescreener.service.js";

import { TournamentStatus } from "../models/tournament.model.js";
import {
  getAllowedCompetitionTypes,
  isFormatAllowed,
  type CompetitionType,
} from "../../sports/config/sport-competition.config.js";
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

      const activeTournament =
        await tournamentRepository.findActiveByOrganizer(user.id);

      if (activeTournament) {
        throw new Error(
          `You already have an active tournament: ${activeTournament.title}. Complete it before hosting another tournament.`
        );
      }
    }

    /*
     * Generic sport → competition validation.
     *
     * `competitionType` is the new canonical competition field.
     * Legacy `type` is kept for backward compatibility with existing
     * tournaments and fixture/payment flows.
     */
    if (data.competitionType) {
      const competitionType =
        data.competitionType as CompetitionType;

      const allowedCompetitions =
        getAllowedCompetitionTypes(data.sport ?? "");

      const selectedRule = allowedCompetitions.find(
        (rule) => rule.type === competitionType,
      );

      if (!selectedRule) {
        throw new Error(
          `Competition type ${competitionType} is not allowed for sport ${data.sport}.`,
        );
      }

      if (!data.format) {
        throw new Error("Tournament format is required.");
      }

      const normalizedFormat = data.format.trim().toUpperCase();

      if (
        !isFormatAllowed(
          data.sport ?? "",
          competitionType,
          normalizedFormat,
        )
      ) {
        throw new Error(
          `Format ${normalizedFormat} is not allowed for ${data.sport} ${competitionType}.`,
        );
      }

      data.format = normalizedFormat;

      const legacyType =
        competitionType === "SINGLES"
          ? "SOLO"
          : competitionType === "DOUBLES" ||
              competitionType === "MIXED_DOUBLES"
            ? "DUO"
            : "TEAM";

      data.type = legacyType as any;

      /*
       * Snapshot the competition rules on the tournament.
       * Future changes to the global sport configuration must not
       * silently change an already-created tournament.
       */
      data.competitionRules = {
        participantCount: selectedRule.participantCount,
        requiresRoster: selectedRule.requiresRoster,
        ...(selectedRule.defaultPlayingSize !== undefined && {
          defaultPlayingSize: selectedRule.defaultPlayingSize,
        }),
        ...(selectedRule.allowsSubstitutes !== undefined && {
          allowsSubstitutes: selectedRule.allowsSubstitutes,
        }),
        ...(selectedRule.requiresMixedGender !== undefined && {
          requiresMixedGender: selectedRule.requiresMixedGender,
        }),
      };
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

    await venueVerificationService.createForTournament({
      tournament: tournament._id as any,
      organizer: user.id as any,
      venueName: tournament.locationName,
      venueAddress: tournament.locationName,
      city: tournament.city,
      state: tournament.state,
      pincode: tournament.pincode,
      venuePhotos: tournament.venuePhotos ?? [],
      venueVideos: tournament.venueVideos ?? [],
      permissionDocs: tournament.permissionDocs ?? [],
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

    const normalizedTournaments =
      tournaments.map((tournament) =>
        this.normalizeCompetitionData(tournament),
      );

    return {
      tournaments: normalizedTournaments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async getMyTournaments(organizerId: string) {
    const tournaments =
      await tournamentRepository.findByOrganizer(organizerId);

    return tournaments.map((tournament) =>
      this.normalizeCompetitionData(tournament),
    );
  }


  async getTournamentById(id: string) {
    const tournament =
      await tournamentRepository.findById(id);

    if (!tournament) {
      return tournament;
    }

    return this.normalizeCompetitionData(tournament);
  }


  private normalizeCompetitionData(
    tournament: ITournament,
  ) {
    if (
      tournament.competitionType &&
      tournament.competitionRules
    ) {
      return tournament;
    }

    const legacyType =
      tournament.type;

    const competitionType =
      tournament.competitionType ??
      (
        legacyType === "SOLO"
          ? "SINGLES"
          : legacyType === "DUO"
            ? "DOUBLES"
            : legacyType === "TEAM"
              ? "TEAM"
              : undefined
      );

    if (!competitionType) {
      return tournament;
    }

    const allowedCompetitions =
      getAllowedCompetitionTypes(
        tournament.sport,
      );

    const selectedRule =
      allowedCompetitions.find(
        (rule) =>
          rule.type === competitionType,
      );

    if (!selectedRule) {
      return tournament;
    }

    return {
      ...(
        typeof (tournament as any).toObject === "function"
          ? (tournament as any).toObject()
          : tournament
      ),
      competitionType,
      competitionRules: {
        participantCount:
          selectedRule.participantCount,
        requiresRoster:
          selectedRule.requiresRoster,
        ...(selectedRule.defaultPlayingSize !== undefined && {
          defaultPlayingSize:
            selectedRule.defaultPlayingSize,
        }),
        ...(selectedRule.allowsSubstitutes !== undefined && {
          allowsSubstitutes:
            selectedRule.allowsSubstitutes,
        }),
        ...(selectedRule.requiresMixedGender !== undefined && {
          requiresMixedGender:
            selectedRule.requiresMixedGender,
        }),
      },
    };
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

    /*
     * Validate the final sport + competition + format combination.
     * Partial updates use the existing tournament values as fallback.
     */
    const finalSport =
      typeof updateData.sport === "string"
        ? updateData.sport
        : tournament.sport;

    const finalCompetitionType =
      typeof updateData.competitionType === "string"
        ? updateData.competitionType
        : tournament.competitionType ??
          (
            tournament.type === "SOLO"
              ? "SINGLES"
              : tournament.type === "DUO"
                ? "DOUBLES"
                : "TEAM"
          );

    const finalFormat =
      typeof updateData.format === "string"
        ? updateData.format.trim().toUpperCase()
        : tournament.format.trim().toUpperCase();

    const allowedCompetitions =
      getAllowedCompetitionTypes(finalSport);

    const selectedRule = allowedCompetitions.find(
      (rule) => rule.type === finalCompetitionType,
    );

    if (!selectedRule) {
      throw new Error(
        `Competition type ${finalCompetitionType} is not allowed for sport ${finalSport}.`,
      );
    }

    if (!finalFormat) {
      throw new Error("Tournament format is required.");
    }

    if (
      !isFormatAllowed(
        finalSport,
        finalCompetitionType,
        finalFormat,
      )
    ) {
      throw new Error(
        `Format ${finalFormat} is not allowed for ${finalSport} ${finalCompetitionType}.`,
      );
    }

    updateData.format = finalFormat;
    updateData.competitionType = finalCompetitionType;

    /*
     * Keep legacy `type` synchronized with the canonical competition type.
     */
    updateData.type =
      finalCompetitionType === "SINGLES"
        ? "SOLO"
        : finalCompetitionType === "DOUBLES" ||
            finalCompetitionType === "MIXED_DOUBLES"
          ? "DUO"
          : "TEAM";

    // Refresh the tournament's competition-rule snapshot when the
    // sport or competition type changes.
    updateData.competitionRules = {
      participantCount: selectedRule.participantCount,
      requiresRoster: selectedRule.requiresRoster,
      ...(selectedRule.defaultPlayingSize !== undefined && {
        defaultPlayingSize: selectedRule.defaultPlayingSize,
      }),
      ...(selectedRule.allowsSubstitutes !== undefined && {
        allowsSubstitutes: selectedRule.allowsSubstitutes,
      }),
      ...(selectedRule.requiresMixedGender !== undefined && {
        requiresMixedGender: selectedRule.requiresMixedGender,
      }),
    };

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

    const venueApproved =
      await venueVerificationService.isApproved(id);

    if (!venueApproved) {
      throw new Error(
        "Venue verification must be approved before the tournament can be approved."
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
