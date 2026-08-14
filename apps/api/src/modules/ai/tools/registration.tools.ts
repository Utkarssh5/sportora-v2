import { tournamentRegistrationService } from "../../tournamentRegistration/services/tournamentRegistration.service.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


export const registrationTools = {

  async register(
    args: {
      tournamentId: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "PLAYER") {
        return {
          success: false,
          message: "Only players can register for tournaments.",
        };
      }

      const registration =
        await tournamentRegistrationService.register(
          args.tournamentId,
          context.user.id
        );

      return {
        success: true,
        data: registration,
        message: "Successfully registered for the tournament.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to register for the tournament.",
      };
    }
  },


  async getMyRegistrations(
    _args: Record<string, never>,
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      const registrations =
        await tournamentRegistrationService.getMyRegistrations(
          context.user.id
        );

      return {
        success: true,
        data: registrations,
        message: "Registrations retrieved successfully.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to retrieve your registrations.",
      };
    }
  },


  async cancel(
    args: {
      registrationId: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "PLAYER") {
        return {
          success: false,
          message: "Only players can cancel their registrations.",
        };
      }

      const registration =
        await tournamentRegistrationService.cancel(
          args.registrationId,
          context.user.id
        );

      return {
        success: true,
        data: registration,
        message: "Tournament registration cancelled successfully.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to cancel the tournament registration.",
      };
    }
  },

};
