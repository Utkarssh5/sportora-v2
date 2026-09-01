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

      /*
       * IMPORTANT:
       * AI discovery must only expose approved tournaments
       * that are still open for registration.
       *
       * This is also required by the tournament discovery
       * safety tests.
       */
      const filter: Record<string, unknown> = {
        status: "APPROVED",
        registrationDeadline: {
          $gt: now,
        },
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
       * IMPORTANT:
       * We NEVER allow the caller to override
       * status: APPROVED.
       *
       * Registration must remain open for AI discovery.
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
      } else if (
        requestedStatus === "COMPLETED" ||
        requestedStatus === "PAST"
      ) {
        /*
         * Keep registrationDeadline > now.
         *
         * This is intentional because AI discovery is only
         * allowed to return tournaments that can still be
         * acted upon through the registration flow.
         */
        filter.endDate = { $lt: now };
      }

      /*
       * Search text across relevant tournament fields.
       */
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

      /*
       * Sport filter.
       */
      if (args.sport) {
        filter.sport = new RegExp(
          `^${escapeRegex(args.sport)}$`,
          "i"
        );
      }

      /*
       * City filter.
       *
       * If nearby=true, do not force an exact city match.
       * The state filter can still be preserved.
       */
      if (args.city && !args.nearby) {
        filter.city = new RegExp(
          `^${escapeRegex(args.city)}$`,
          "i"
        );
      }

      /*
       * State / region filter.
       */
      if (args.state) {
        filter.state = new RegExp(
          `^${escapeRegex(args.state)}$`,
          "i"
        );
      }

      /*
       * Entry fee range.
       */
      if (
        args.minEntryFee !== undefined ||
        args.maxEntryFee !== undefined
      ) {
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
       * Invalid dates are ignored rather than creating
       * an invalid MongoDB Date object.
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

      /*
       * Maximum AI discovery limit = 20.
       */
      const result = await tournamentService.getTournaments(
        filter,
        args.page ?? 1,
        Math.min(args.limit ?? 10, 20)
      );

      /*
       * If no approved tournament matches the requested criteria,
       * check whether matching tournaments are awaiting approval.
       *
       * This keeps the search truthful while giving the AI enough
       * structured information to explain the situation naturally.
       */
      if (result.tournaments.length === 0) {
        const pendingFilter: Record<string, unknown> = {
          ...filter,
          status: "PENDING_APPROVAL",
        };

        // Approval status, not registration availability,
        // determines this fallback search.
        delete pendingFilter.registrationDeadline;

        const pendingResult =
          await tournamentService.getTournaments(
            pendingFilter,
            1,
            Math.min(args.limit ?? 10, 20)
          );

        if (pendingResult.tournaments.length > 0) {
          return {
            success: true,
            data: {
              tournaments: [],
              total: 0,
              page: 1,
              limit: pendingResult.limit,
              totalPages: 0,
              availability: "MATCHING_NOT_APPROVED",
              matchingButUnavailable:
                pendingResult.tournaments,
              actionable: false,
            },
            message:
              "Matching tournaments were found, but they are currently awaiting approval.",
          };
        }
      }

      return {
        success: true,
        data: result,
        message: `Found ${result.tournaments.length} tournament(s).`,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Unable to search tournaments.",
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
      const tournament =
        await tournamentService.getTournamentById(
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
        message:
          error.message ||
          "Unable to get tournament details.",
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
      if (
        context.user.role !== "ORGANIZER" &&
        context.user.role !== "ADMIN"
      ) {
        return {
          success: false,
          message:
            "Only organizers or admins can create tournaments.",
        };
      }

      const tournament =
        await tournamentService.createTournament(
          {
            ...args,
            startDate: new Date(args.startDate),
            endDate: new Date(args.endDate),
            registrationDeadline: new Date(
              args.registrationDeadline
            ),
            ...(args.type
              ? { type: args.type as any }
              : {}),
            ...(args.competitionType
              ? {
                  competitionType:
                    args.competitionType as any,
                }
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
        message:
          error.message ||
          "Unable to create tournament.",
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
      if (
        context.user.role !== "ORGANIZER" &&
        context.user.role !== "ADMIN"
      ) {
        return {
          success: false,
          message:
            "Only organizers or admins can update tournaments.",
        };
      }

      const tournament =
        await tournamentService.updateTournament(
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
        message:
          error.message ||
          "Unable to update tournament.",
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
      if (
        context.user.role !== "ORGANIZER" &&
        context.user.role !== "ADMIN"
      ) {
        return {
          success: false,
          message:
            "Only organizers or admins can delete tournaments.",
        };
      }

      const result =
        await tournamentService.deleteTournament(
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
        message:
          error.message ||
          "Unable to delete tournament.",
      };
    }
  },
};

function escapeRegex(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}
