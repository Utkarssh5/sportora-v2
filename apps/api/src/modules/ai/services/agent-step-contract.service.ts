import type {
  AgentContext,
  AgentPlanStep,
} from "../types.js";

export interface AgentStepContractContext {
  context: AgentContext;

  /**
   * Runtime information already known by the agent.
   *
   * Examples:
   * {
   *   sport: "Football",
   *   city: "Jaipur"
   * }
   */
  information?: Record<string, unknown>;

  /**
   * Explicitly confirmed user actions.
   *
   * Example:
   * {
   *   payment: true
   * }
   */
  confirmations?: Record<string, boolean>;
}

export interface AgentStepContractResult {
  executable: boolean;
  reason?: string;
}

export class AgentStepContractService {
  public static evaluate(
    step: AgentPlanStep,
    runtime: AgentStepContractContext
  ): AgentStepContractResult {
    /*
     * A step explicitly marked as requiring user input
     * cannot execute automatically.
     */
    if (step.requiresUserInput === true) {
      return {
        executable: false,
        reason:
          `Step ${step.id} requires explicit user input.`,
      };
    }

    /*
     * Every piece of required information must already
     * exist in runtime state.
     */
    for (const field of step.requiredInformation ?? []) {
      const value =
        runtime.information?.[field];

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return {
          executable: false,
          reason:
            `Step ${step.id} requires missing information: ${field}.`,
        };
      }
    }

    /*
     * Constraints are evaluated deterministically.
     *
     * The planner may describe constraints, but the runtime
     * state must satisfy them before execution.
     */
    for (const [key, expected] of Object.entries(
      step.constraints ?? {}
    )) {
      const actual =
        runtime.information?.[key];

      if (actual !== expected) {
        return {
          executable: false,
          reason:
            `Step ${step.id} constraint failed for ${key}.`,
        };
      }
    }

    return {
      executable: true,
    };
  }
}

export const agentStepContractService =
  AgentStepContractService;
