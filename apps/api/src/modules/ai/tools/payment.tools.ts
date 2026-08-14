import { paymentService } from "../../payment/services/payment.service.js";

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

      const payment =
        await paymentService.createOrder({
          tournamentId: args.tournamentId,
          userId: context.user.id,
        });

      return {
        success: true,
        data: payment,
        message:
          "Payment order created successfully. Complete the actual payment through the payment flow.",
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
