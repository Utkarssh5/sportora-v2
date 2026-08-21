import { tournamentRepository } from "../repositories/tournament.repository.js";
import {
  TournamentStatus,
} from "../models/tournament.model.js";
import {
  tournamentCrewRequirementRepository,
} from "../repositories/tournament-crew-requirement.repository.js";
import {
  tournamentCrewWorkOpportunityRepository,
} from "../repositories/tournament-crew-work-opportunity.repository.js";
import { userRepository } from "../../users/repositories/user.repository.js";

interface CrewOpportunityInput {
  requirementId: string;
  payoutAmount: number;
}

class TournamentCrewWorkOpportunityService {
  async publishOpportunities(
    tournamentId: string,
    data: {
      crewNeeded: boolean;
      opportunities?: CrewOpportunityInput[];
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
        "You do not have permission to manage crew work opportunities for this tournament."
      );
    }

    if (
      tournament.status === TournamentStatus.COMPLETED ||
      tournament.status === TournamentStatus.CANCELLED
    ) {
      throw new Error(
        "Crew work opportunities cannot be created for a completed or cancelled tournament."
      );
    }

    if (!tournament.registrationDeadline) {
      throw new Error(
        "Tournament registration deadline is not configured."
      );
    }

    if (
      new Date(tournament.registrationDeadline) >
      new Date()
    ) {
      throw new Error(
        "Crew work opportunities can only be published after the registration deadline."
      );
    }

    if (!data.crewNeeded) {
      return {
        crewNeeded: false,
        opportunities: [],
      };
    }

    if (
      !Array.isArray(data.opportunities) ||
      data.opportunities.length === 0
    ) {
      throw new Error(
        "At least one crew opportunity is required when crew is needed."
      );
    }

    const requirementIds = new Set<string>();

    for (const item of data.opportunities) {
      if (requirementIds.has(item.requirementId)) {
        throw new Error(
          "The same crew requirement cannot be published more than once."
        );
      }

      requirementIds.add(item.requirementId);

      if (
        !Number.isFinite(item.payoutAmount) ||
        item.payoutAmount <= 0
      ) {
        throw new Error(
          "Each crew payout amount must be greater than 0."
        );
      }

      const requirement =
        await tournamentCrewRequirementRepository.findById(
          item.requirementId
        );

      if (!requirement) {
        throw new Error(
          `Crew requirement not found: ${item.requirementId}`
        );
      }

      if (
        requirement.tournamentId.toString() !==
        tournamentId
      ) {
        throw new Error(
          "A crew requirement does not belong to this tournament."
        );
      }

      if (
        requirement.filledQuantity >=
        requirement.quantity
      ) {
        throw new Error(
          `Crew requirement "${requirement.role}" is already filled.`
        );
      }

      const existing =
        await tournamentCrewWorkOpportunityRepository.findByTournament(
          tournamentId
        );

      const alreadyOpen = existing.some(
        (opportunity) =>
          opportunity.requirementId.toString() ===
            item.requirementId &&
          opportunity.status === "OPEN"
      );

      if (alreadyOpen) {
        throw new Error(
          `A work opportunity for "${requirement.role}" is already open.`
        );
      }
    }

    const created = [];

    for (const item of data.opportunities) {
      const requirement =
        await tournamentCrewRequirementRepository.findById(
          item.requirementId
        );

      if (!requirement) {
        throw new Error(
          `Crew requirement not found: ${item.requirementId}`
        );
      }

      const opportunity =
        await tournamentCrewWorkOpportunityRepository.create({
          tournamentId,
          requirementId: item.requirementId,
          role: requirement.role,
          quantity:
            requirement.quantity -
            requirement.filledQuantity,
          payoutAmount: item.payoutAmount,
        });

      created.push(opportunity);
    }

    return {
      crewNeeded: true,
      count: created.length,
      opportunities: created,
    };
  }

  async getTournamentOpportunities(
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
        "You do not have permission to view crew work opportunities for this tournament."
      );
    }

    return tournamentCrewWorkOpportunityRepository.findByTournament(
      tournamentId
    );
  }

  async getOpenOpportunities() {
    const opportunities =
      await tournamentCrewWorkOpportunityRepository.findOpen();

    return Promise.all(
      opportunities.map(async (opportunity) => {
        const tournament =
          opportunity.tournamentId &&
          typeof opportunity.tournamentId === "object"
            ? (opportunity.tournamentId as unknown as {
                _id: string;
                title?: string;
                sport?: string;
                format?: string;
                type?: string;
                competitionType?: string;
                city?: string;
                state?: string;
                locationName?: string;
                startDate?: Date;
                endDate?: Date;
                organizerId?: {
                  toString(): string;
                };
              })
            : null;

        if (!tournament) {
          return opportunity;
        }

        const organizerId =
          tournament.organizerId?.toString();

        const organizer = organizerId
          ? await userRepository.findById(organizerId)
          : null;

        return {
          ...opportunity.toObject(),
          tournamentId: {
            ...tournament,
            organizer: organizer
              ? {
                  fullName: organizer.fullName,
                }
              : null,
          },
        };
      })
    );
  }
}

export const tournamentCrewWorkOpportunityService =
  new TournamentCrewWorkOpportunityService();
