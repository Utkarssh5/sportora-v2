import type {
  AgentWorkflowStage,
} from "../types.js";

type WorkflowState = {
  goal?: {
    status: AgentWorkflowStage;
    lastObservation?: string | null;
  } | null | undefined;
};

export type AgentWorkflowDecision =
  | "CONTINUE"
  | "ASK_USER"
  | "STOP";

export interface AgentWorkflowEvaluation {
  decision: AgentWorkflowDecision;
  reason: string;
  allowedNextTool?: string;
}

export class AgentWorkflowService {
  public static isToolAllowed(
    evaluation: AgentWorkflowEvaluation,
    toolName: string
  ): boolean {
    if (!evaluation.allowedNextTool) {
      return true;
    }

    return evaluation.allowedNextTool === toolName;
  }

  public static evaluate(
    agentState: WorkflowState | null | undefined
  ): AgentWorkflowEvaluation {
    const goal = agentState?.goal;

    if (!goal) {
      return {
        decision: "CONTINUE",
        reason: "No active workflow goal requires a gate.",
      };
    }

    const status: AgentWorkflowStage =
      goal.status;

    switch (status) {
      case "WAITING_CONFIRMATION":
        return {
          decision: "ASK_USER",
          reason:
            "Explicit player confirmation is required before payment can proceed.",
        };

      case "PAYMENT_READY":
        return {
          decision: "CONTINUE",
          reason:
            "Registration payment has been explicitly confirmed.",
          allowedNextTool:
            "create_payment_order",
        };

      case "PAYMENT_PENDING":
        return {
          decision: "STOP",
          reason:
            "Payment order exists, but actual payment has not yet been verified.",
        };

      case "NEEDS_CLARIFICATION":
        return {
          decision: "ASK_USER",
          reason:
            goal.lastObservation ||
            "Additional information is required from the player.",
        };

      case "FAILED":
        return {
          decision: "CONTINUE",
          reason:
            goal.lastObservation ||
            "The previous action failed and the agent may attempt safe recovery.",
        };

      case "COMPLETED":
        return {
          decision: "STOP",
          reason:
            "The current workflow has already been completed.",
        };

      default:
        return {
          decision: "CONTINUE",
          reason:
            "The current workflow does not require an execution gate.",
        };
    }
  }
}

export const agentWorkflowService =
  AgentWorkflowService;
