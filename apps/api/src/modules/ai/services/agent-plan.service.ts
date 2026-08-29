import { aiRepository } from "../repositories/ai.repository.js";

import {
  AgentPlanValidatorService,
} from "./agent-plan-validator.service.js";

import type {
  AgentContext,
  AgentGoalType,
  AgentPlan,
  AgentPlanStep,
} from "../types.js";

export class AgentPlanService {
  public static async createAndPersistPlan(
    goalType: AgentGoalType,
    context: AgentContext
  ): Promise<AgentPlan> {
    const plan =
      this.createPlan(goalType);

    const validation =
      AgentPlanValidatorService.validate(
        plan
      );

    if (!validation.valid) {
      throw new Error(
        `Invalid agent plan: ${validation.errors.join("; ")}`
      );
    }

    if (!context.conversationId) {
      throw new Error(
        "Conversation context is required to persist an agent plan."
      );
    }

    await aiRepository.updateAgentPlan(
      context.conversationId,
      plan
    );

    return plan;
  }

  public static createPlan(
    goalType: AgentGoalType
  ): AgentPlan {
    const steps =
      this.getStepsForGoal(goalType);

    return {
      version: 1,
      steps,
      ...(steps[0]
        ? { currentStepId: steps[0].id }
        : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static getStepsForGoal(
    goalType: AgentGoalType
  ): AgentPlanStep[] {
    switch (goalType) {
      case "DISCOVER_TOURNAMENT":
        return [
          this.step(
            "search-tournaments",
            "SEARCH_TOURNAMENTS",
            "Find tournaments matching the player's requirements and available location/sport filters.",
            "search_tournaments"
          ),
        ];

      case "VIEW_TOURNAMENT":
        return [
          this.step(
            "get-tournament",
            "GET_TOURNAMENT",
            "Retrieve the selected tournament details.",
            "get_tournament"
          ),
        ];

      case "REGISTER_TOURNAMENT":
        return [
          this.step(
            "search-tournaments",
            "SEARCH_TOURNAMENTS",
            "Find tournaments matching the player's requirements.",
            "search_tournaments"
          ),
          this.step(
            "select-tournament",
            "SELECT_TOURNAMENT",
            "Select a suitable tournament from the available candidates."
          ),
          this.step(
            "get-tournament",
            "GET_TOURNAMENT",
            "Verify the selected tournament details.",
            "get_tournament",
            ["search-tournaments", "select-tournament"]
          ),
          this.step(
            "register",
            "REGISTER_TOURNAMENT",
            "Create the tournament registration.",
            "register_for_tournament",
            ["get-tournament"]
          ),
          this.step(
            "confirm-payment",
            "CONFIRM_PAYMENT",
            "Obtain explicit player confirmation when payment is required.",
            "confirm_pending_registration",
            ["register"]
          ),
          this.step(
            "create-payment-order",
            "CREATE_PAYMENT_ORDER",
            "Create the payment order after confirmation.",
            "create_payment_order",
            ["confirm-payment"]
          ),
          this.step(
            "verify-payment",
            "VERIFY_PAYMENT",
            "Verify that the payment has actually succeeded.",
            undefined,
            ["create-payment-order"]
          ),
          this.step(
            "verify-registration",
            "VERIFY_REGISTRATION",
            "Verify the final registration and ticket state.",
            undefined,
            ["verify-payment"]
          ),
        ];

      case "CHECK_REGISTRATIONS":
        return [
          this.step(
            "get-my-registrations",
            "GET_MY_REGISTRATIONS",
            "Retrieve the player's registrations.",
            "get_my_registrations"
          ),
        ];

      case "CANCEL_REGISTRATION":
        return [
          this.step(
            "cancel-registration",
            "CANCEL_REGISTRATION",
            "Cancel the selected registration.",
            "cancel_registration"
          ),
        ];

      case "CHECK_MATCH":
        return [
          this.step(
            "get-match-information",
            "GET_MATCH_INFORMATION",
            "Retrieve the player's match information.",
            "get_match_details"
          ),
        ];

      case "VIEW_PROFILE":
        return [
          this.step(
            "get-profile",
            "GET_PROFILE",
            "Retrieve the player's profile.",
            "get_my_profile"
          ),
        ];

      case "PAYMENT":
        return [
          this.step(
            "create-payment-order",
            "CREATE_PAYMENT_ORDER",
            "Create a payment order after all payment guards pass.",
            "create_payment_order"
          ),
        ];
    }
  }

  private static step(
    id: string,
    action: string,
    description: string,
    toolName?: string,
    dependsOn?: string[]
  ): AgentPlanStep {
    return {
      id,
      action,
      description,
      status: "PENDING",
      ...(toolName ? { toolName } : {}),
      ...(dependsOn ? { dependsOn } : {}),
    };
  }
}

export const agentPlanService =
  AgentPlanService;
