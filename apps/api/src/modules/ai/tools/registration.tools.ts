import { tournamentRegistrationService } from "../../tournamentRegistration/services/tournamentRegistration.service.js";
import { tournamentService } from "../../tournaments/services/tournament.service.js";
import { aiRepository } from "../repositories/ai.repository.js";

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

      /*
       * Paid tournaments require an explicit confirmation
       * before a payment order can be created.
       *
       * IMPORTANT:
       * Do not call tournamentRegistrationService.register()
       * for a paid tournament here because that service can
       * create a registration without payment.
       */
      if (tournament.entryFee > 0) {
        await aiRepository.setPendingRegistration(
          context.conversationId!,
          args.tournamentId,
          "PAYMENT_REQUIRED"
        );

        return {
          success: true,
          data: {
            tournamentId: args.tournamentId,
            entryFee: tournament.entryFee,
            paymentRequired: true,
            confirmationRequired: true,
          },
          message:
            `This tournament requires a payment of ₹${tournament.entryFee}. ` +
            "Please explicitly confirm that you want to proceed with the payment.",
        };
      }

      const registration =
        await tournamentRegistrationService.register(
          args.tournamentId,
          context.user.id
        );

      await aiRepository.clearPendingRegistration(
        context.conversationId!
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

  async confirmPendingRegistration(
    _args: Record<string, never>,
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (!context.conversationId) {
        return {
          success: false,
          message: "Conversation context is required.",
        };
      }

      if (!context.requestStartedAt) {
        return {
          success: false,
          message: "Current request context is unavailable.",
        };
      }

      const pending =
        await aiRepository.confirmPendingRegistration(
          context.conversationId,
          context.requestStartedAt
        );

      if (!pending?.tournamentId) {
        return {
          success: false,
          message:
            "There is no pending tournament registration awaiting confirmation.",
        };
      }

      return {
        success: true,
        data: {
          tournamentId: pending.tournamentId,
          action: pending.action,
          confirmed: true,
        },
        message:
          "Registration request confirmed. The payment order can now be created.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to confirm the pending registration.",
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
