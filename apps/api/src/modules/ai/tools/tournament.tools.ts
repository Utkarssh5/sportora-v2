import { tournamentService } from "../../tournaments/services/tournament.service.js";
import type { AgentContext, AgentToolResult } from "../types.js";

export const tournamentTools = {

  async searchTournaments(
    args: {
      sport?: string;
      city?: string;
      state?: string;
      status?: string;
      minEntryFee?: number;
      maxEntryFee?: number;
      page?: number;
      limit?: number;
    },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const filter: Record<string, unknown> = {};

      if (args.sport) {
        filter.sport = new RegExp(`^${escapeRegex(args.sport)}$`, "i");
      }

      if (args.city) {
        filter.city = new RegExp(`^${escapeRegex(args.city)}$`, "i");
      }

      if (args.state) {
        filter.state = new RegExp(`^${escapeRegex(args.state)}$`, "i");
      }

      if (args.status) {
        filter.status = args.status.toUpperCase();
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
