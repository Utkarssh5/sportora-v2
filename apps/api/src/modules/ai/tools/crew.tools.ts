import { crewService } from "../../crew/services/crew.service.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


export const crewTools = {

  async registerCrew(
    args: {
      fullName: string;
      role: string;
      sportsExpertise: string[];
      city: string;
      state: string;
      experienceYears: number;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "CREW") {
        return {
          success: false,
          message: "Only crew users can register a crew profile.",
        };
      }

      const crew =
        await crewService.registerCrew({
          userId: context.user.id,
          fullName: args.fullName,
          role: args.role,
          sportsExpertise: args.sportsExpertise,
          city: args.city,
          state: args.state,
          experienceYears: args.experienceYears,
        });

      return {
        success: true,
        data: crew,
        message:
          "Successfully registered in the Ground Crew Marketplace.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to register crew profile.",
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
      if (context.user.role !== "CREW") {
        return {
          success: false,
          message:
            "Only crew users can update crew availability.",
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
