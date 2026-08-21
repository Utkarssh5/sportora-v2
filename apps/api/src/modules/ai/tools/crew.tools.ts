import { crewService } from "../../crew/services/crew.service.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


export const crewTools = {

  async registerCrew(
    args: {
      role: string;
      sportsExpertise: string[];
      skills: string[];
      experienceYears: number;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (!["PLAYER", "ORGANIZER"].includes(context.user.role)) {
        return {
          success: false,
          message: "Only player or organizer accounts can activate Ground Crew.",
        };
      }

      const crew = await crewService.registerCrew({
        userId: context.user.id,
        role: args.role,
        sportsExpertise: args.sportsExpertise,
        skills: args.skills,
        experienceYears: args.experienceYears,
      });

      return {
        success: true,
        data: crew,
        message:
          "Successfully activated the Ground Crew profile.",
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to activate Ground Crew profile.",
      };
    }
  },


  async updateAvailability(
    args: {
      isAvailable: boolean;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (!["PLAYER", "ORGANIZER"].includes(context.user.role)) {
        return {
          success: false,
          message:
            "Only player or organizer accounts can manage Ground Crew availability.",
        };
      }

      const crew =
        await crewService.updateAvailability(
          context.user.id,
          args.isAvailable
        );

      return {
        success: true,
        data: crew,
        message:
          "Crew availability updated successfully.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to update crew availability.",
      };
    }
  },


  async getAvailableCrew(
    args: {
      city?: string;
      sport?: string;
    },
    _context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const crewList =
        await crewService.getAvailableCrew(
          args.city,
          args.sport
        );

      return {
        success: true,
        data: crewList,
        message:
          "Available crew retrieved successfully.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to retrieve available crew.",
      };
    }
  },

};
