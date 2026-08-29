import { tournamentService } from "../../tournaments/services/tournament.service.js";
import type { AgentContext, AgentToolResult } from "../types.js";

export const tournamentTools = {

  async searchTournaments(
    args: {
      search?: string;
      sport?: string;
      city?: string;
      state?: string;
      nearby?: boolean;
      status?: string;
      minEntryFee?: number;
      maxEntryFee?: number;
      startDateFrom?: string;
      startDateTo?: string;
      page?: number;
      limit?: number;
    },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      console.log(
        "[AI] search_tournaments args:",
        JSON.stringify(args, null, 2)
      );

      const now = new Date();

      const filter: Record<string, unknown> = {
        status: "APPROVED",
      };

      /*
       * Tournament status is derived from start/end dates.
       *
       * ONGOING:
       *   startDate <= now <= endDate
       *
       * UPCOMING:
       *   startDate > now
       *
       * COMPLETED:
       *   endDate < now
       *
       * Keep registrationDeadline separate because an ongoing
       * tournament may already have closed registration.
       */
      const requestedStatus =
        typeof args.status === "string"
          ? args.status.trim().toUpperCase()
          : "";

      if (
        requestedStatus === "ONGOING" ||
        requestedStatus === "LIVE" ||
        requestedStatus === "CURRENT"
      ) {
        filter.startDate = { $lte: now };
        filter.endDate = { $gte: now };
      } else if (
        requestedStatus === "UPCOMING" ||
        requestedStatus === "FUTURE"
      ) {
        filter.startDate = { $gt: now };
        filter.registrationDeadline = {
          $gt: now,
        };
      } else if (
        requestedStatus === "COMPLETED" ||
        requestedStatus === "PAST"
      ) {
        filter.endDate = { $lt: now };
        filter.registrationDeadline = {
          $gt: now,
        };
      } else {
        /*
         * Default and unknown-status discovery must preserve the
         * existing safety rule: only approved tournaments with
         * an open registration deadline are discoverable.
         */
        filter.registrationDeadline = {
          $gt: now,
        };
      }

      if (args.search) {
        const searchRegex = new RegExp(
          escapeRegex(args.search),
          "i"
        );

        filter.$or = [
          { title: searchRegex },
          { sport: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
          { locationName: searchRegex },
        ];
      }

      if (args.sport) {
        filter.sport = new RegExp(`^${escapeRegex(args.sport)}$`, "i");
      }

      if (args.city && !args.nearby) {
        filter.city = new RegExp(escapeRegex(args.city), "i");
      }

      if (args.state) {
        filter.state = new RegExp(`^${escapeRegex(args.state)}$`, "i");
      }

      if (args.minEntryFee !== undefined || args.maxEntryFee !== undefined) {
        const entryFee: Record<string, number> = {};

        if (args.minEntryFee !== undefined) {
          entryFee.$gte = args.minEntryFee;
        }

        if (args.maxEntryFee !== undefined) {
          entryFee.$lte = args.maxEntryFee;
        }

        filter.entryFee = entryFee;
      }

      /*
       * Optional explicit tournament start-date range.
       *
       * These filters are combined with the existing status,
       * sport, city, state and entry-fee filters.
       */
      if (args.startDateFrom || args.startDateTo) {
        const startDate: Record<string, Date> = {};

        if (args.startDateFrom) {
          const from = new Date(args.startDateFrom);

          if (!Number.isNaN(from.getTime())) {
            startDate.$gte = from;
          }
        }

        if (args.startDateTo) {
          const to = new Date(args.startDateTo);

          if (!Number.isNaN(to.getTime())) {
            startDate.$lte = to;
          }
        }

        if (Object.keys(startDate).length > 0) {
          filter.startDate = startDate;
        }
      }

      const result = await tournamentService.getTournaments(
        filter,
        args.page ?? 1,
        Math.min(args.limit ?? 10, 20)
      );

      return {
        success: true,
        data: result,
        message: `Found ${result.tournaments.length} tournament(s).`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to search tournaments.",
      };
    }
  },

  async getTournament(
    args: {
      tournamentId: string;
    },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const tournament = await tournamentService.getTournamentById(
        args.tournamentId
      );

      if (!tournament) {
        return {
          success: false,
          message: "Tournament not found.",
        };
      }

      return {
        success: true,
        data: tournament,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to get tournament details.",
      };
    }
  },

  async createTournament(
    args: {
      title: string;
      sport: string;
      format: string;
      type?: string;
      competitionType?: string;
      city: string;
      state: string;
      locationName: string;
      pincode?: string;
      venuePhotos?: string[];
      venueVideos?: string[];
      permissionDocs?: string[];
      startDate: string;
      endDate: string;
      registrationDeadline: string;
      maxParticipants: number;
      entryFee: number;
      prizePool: number;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "ORGANIZER" && context.user.role !== "ADMIN") {
        return {
          success: false,
          message: "Only organizers or admins can create tournaments.",
        };
      }

      const tournament = await tournamentService.createTournament(
        {
          ...args,
          startDate: new Date(args.startDate),
          endDate: new Date(args.endDate),
          registrationDeadline: new Date(args.registrationDeadline),
          ...(args.type ? { type: args.type as any } : {}),
          ...(args.competitionType
            ? { competitionType: args.competitionType as any }
            : {}),
        },
        {
          id: context.user.id,
          role: context.user.role,
        }
      );

      return {
        success: true,
        data: tournament,
        message: "Tournament created successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to create tournament.",
      };
    }
  },

  async updateTournament(
    args: {
      tournamentId: string;
      updates: Record<string, unknown>;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "ORGANIZER" && context.user.role !== "ADMIN") {
        return {
          success: false,
          message: "Only organizers or admins can update tournaments.",
        };
      }

      const tournament = await tournamentService.updateTournament(
        args.tournamentId,
        args.updates as any,
        {
          id: context.user.id,
          role: context.user.role,
        }
      );

      return {
        success: true,
        data: tournament,
        message: "Tournament updated successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to update tournament.",
      };
    }
  },

  async deleteTournament(
    args: {
      tournamentId: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "ORGANIZER" && context.user.role !== "ADMIN") {
        return {
          success: false,
          message: "Only organizers or admins can delete tournaments.",
        };
      }

      const result = await tournamentService.deleteTournament(
        args.tournamentId,
        {
          id: context.user.id,
          role: context.user.role,
        }
      );

      return {
        success: true,
        data: result,
        message: "Tournament deleted successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to delete tournament.",
      };
    }
  },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
