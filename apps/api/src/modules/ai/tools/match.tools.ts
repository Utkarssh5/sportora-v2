import { matchService } from "../../match/services/match.service.js";
import { TournamentModel } from "../../tournaments/models/tournament.model.js";
import {
  tournamentCrewAssignmentRepository,
} from "../../tournaments/repositories/tournament-crew-assignment.repository.js";
import { CrewModel } from "../../crew/models/crew.model.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";

export const matchTools = {
  async getMatchDetails(
    args: { matchId: string },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const match = await matchService.getMatchDetails(args.matchId);

      return {
        success: true,
        data: match,
        message: "Match details retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to retrieve match details.",
      };
    }
  },

  async getTournamentMatches(
    args: { tournamentId: string },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const matches = await matchService.getTournamentMatches(
        args.tournamentId
      );

      return {
        success: true,
        data: matches,
        message: "Tournament matches retrieved successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to retrieve tournament matches.",
      };
    }
  },

  async updateScore(
    args: {
      matchId: string;
      scoreA?: number;
      scoreB?: number;
      currentSet?: number;
      status?: string;
      winner?: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const { id: userId, role } = context.user;

      // Only ORGANIZER, CREW and ADMIN can update scores.
      if (
        role !== "ORGANIZER" &&
        role !== "CREW" &&
        role !== "ADMIN"
      ) {
        return {
          success: false,
          message: "You do not have permission to update match scores.",
        };
      }

      // ADMIN can update any match.
      if (role !== "ADMIN") {
        const match = await matchService.getMatchDetails(args.matchId);

        const tournament = await TournamentModel.findById(
          match.tournamentId
        );

        if (!tournament) {
          return {
            success: false,
            message: "Tournament for this match was not found.",
          };
        }

        // ORGANIZER can update matches only in their own tournament.
        if (role === "ORGANIZER") {
          const isOwner =
            tournament.organizerId.toString() === userId;

          if (!isOwner) {
            return {
              success: false,
              message:
                "You can only update matches from your own tournaments.",
            };
          }
        }

        // CREW can update matches only in tournaments
        // where they are assigned.
        if (role === "CREW") {
          const crew = await CrewModel.findOne({
            userId,
          });

          if (!crew) {
            return {
              success: false,
              message: "Crew profile not found.",
            };
          }

          const assignment =
            await tournamentCrewAssignmentRepository
              .findByTournamentAndCrew(
                tournament._id.toString(),
                crew._id.toString()
              );

          if (!assignment) {
            return {
              success: false,
              message:
                "You are not assigned to this tournament.",
            };
          }
        }
      }

      const match = await matchService.updateScore(args.matchId, {
        ...(args.scoreA !== undefined
          ? { scoreA: args.scoreA }
          : {}),
        ...(args.scoreB !== undefined
          ? { scoreB: args.scoreB }
          : {}),
        ...(args.currentSet !== undefined
          ? { currentSet: args.currentSet }
          : {}),
        ...(args.status !== undefined
          ? { status: args.status as any }
          : {}),
        ...(args.winner !== undefined
          ? { winner: args.winner }
          : {}),
      });

      return {
        success: true,
        data: match,
        message: "Match score updated successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to update match score.",
      };
    }
  },

  async createMatch(
    args: {
      tournamentId: string;
      round: string;
      matchNumber: number;
      teamA: string;
      teamB: string;
      nextMatchId?: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const { id: userId, role } = context.user;

      // Only ORGANIZER and ADMIN can create matches.
      if (
        role !== "ORGANIZER" &&
        role !== "ADMIN"
      ) {
        return {
          success: false,
          message: "Only organizers or admins can create matches.",
        };
      }

      // ORGANIZER can create matches only in their own tournament.
      if (role === "ORGANIZER") {
        const tournament = await TournamentModel.findById(
          args.tournamentId
        );

        if (!tournament) {
          return {
            success: false,
            message: "Tournament not found.",
          };
        }

        const isOwner =
          tournament.organizerId.toString() === userId;

        if (!isOwner) {
          return {
            success: false,
            message:
              "You can only create matches for your own tournaments.",
          };
        }
      }

      const match = await matchService.createMatch({
        tournamentId: args.tournamentId,
        round: args.round as any,
        matchNumber: args.matchNumber,
        teamA: args.teamA,
        teamB: args.teamB,
        ...(args.nextMatchId !== undefined
          ? { nextMatchId: args.nextMatchId }
          : {}),
      });

      return {
        success: true,
        data: match,
        message: "Match scheduled successfully.",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Unable to create match.",
      };
    }
  },
};
