import { paymentService } from "../../payment/services/payment.service.js";
import { aiRepository } from "../repositories/ai.repository.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


export const paymentTools = {

  async createOrder(
    args: {
      tournamentId: string;
    },
    context: AgentContext
  ): Promise<AgentToolResult> {
    try {
      if (context.user.role !== "PLAYER") {
        return {
          success: false,
          message: "Only players can create tournament payment orders.",
        };
      }

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
        await aiRepository.getPendingRegistration(
          context.conversationId
        );

      /*
       * Server-side safety gate:
       * a payment order can only be created when the player
       * explicitly confirmed a pending registration request
       * during the current conversation flow.
       */
      if (
        !pending?.tournamentId ||
        pending.tournamentId !== args.tournamentId ||
        pending.action !== "PAYMENT_REQUIRED" ||
        !pending.confirmedAt ||
        pending.confirmedAt < context.requestStartedAt
      ) {
        return {
          success: false,
          message:
            "Explicit confirmation is required before creating a payment order.",
        };
      }

      const payment =
        await paymentService.createOrder({
          tournamentId: args.tournamentId,
          userId: context.user.id,
        });

      await aiRepository.clearPendingRegistration(
        context.conversationId
      );

      return {
        success: true,
        data: payment,
        message:
          "Payment order created successfully. Complete the actual payment through the payment flow. Payment is not completed yet.",
      };

    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          "Unable to create payment order.",
      };
    }
  },

};
