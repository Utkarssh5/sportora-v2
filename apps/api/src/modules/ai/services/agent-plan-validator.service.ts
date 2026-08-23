import type {
  AgentPlan,
} from "../types.js";

export interface AgentPlanValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Canonical mapping between planner actions and executable
 * PLAYER tools.
 *
 * Actions without a toolName are deliberate backend checkpoints.
 */
const ACTION_TOOL_MAP: Record<string, string | undefined> = {
  SEARCH_TOURNAMENTS: "search_tournaments",
  SELECT_TOURNAMENT: undefined,
  GET_TOURNAMENT: "get_tournament",
  REGISTER_TOURNAMENT: "register_for_tournament",
  CONFIRM_PAYMENT: "confirm_pending_registration",
  CREATE_PAYMENT_ORDER: "create_payment_order",
  VERIFY_PAYMENT: undefined,
  VERIFY_REGISTRATION: undefined,

  GET_MY_REGISTRATIONS: "get_my_registrations",
  CANCEL_REGISTRATION: "cancel_registration",
  GET_MATCH_INFORMATION: "get_match_details",
  GET_PROFILE: "get_my_profile",
};

export class AgentPlanValidatorService {
  public static validate(
    plan: AgentPlan
  ): AgentPlanValidationResult {
    const errors: string[] = [];

    if (
      !Number.isInteger(plan.version) ||
      plan.version < 1
    ) {
      errors.push(
        "Plan version must be a positive integer."
      );
    }

    if (
      !Array.isArray(plan.steps) ||
      plan.steps.length === 0
    ) {
      errors.push(
        "Plan must contain at least one step."
      );

      return {
        valid: false,
        errors,
      };
    }

    const ids = new Set<string>();

    for (const step of plan.steps) {
      if (!step.id.trim()) {
        errors.push(
          "Every plan step must have an id."
        );
      }

      if (ids.has(step.id)) {
        errors.push(
          `Duplicate plan step id: ${step.id}`
        );
      }

      ids.add(step.id);

      /*
       * Semantic action/tool validation.
       *
       * This is the security boundary for LLM-generated plans.
       */
      if (
        !Object.prototype.hasOwnProperty.call(
          ACTION_TOOL_MAP,
          step.action
        )
      ) {
        errors.push(
          `Unknown plan action: ${step.action}`
        );
      } else {
        const expectedTool =
          ACTION_TOOL_MAP[step.action];

        if (
          expectedTool === undefined &&
          step.toolName
        ) {
          errors.push(
            `Plan action ${step.action} must not define a toolName.`
          );
        }

        if (
          expectedTool !== undefined &&
          step.toolName !== expectedTool
        ) {
          errors.push(
            `Plan action ${step.action} must use tool ${expectedTool}.`
          );
        }
      }
    }

    if (
      plan.currentStepId &&
      !ids.has(plan.currentStepId)
    ) {
      errors.push(
        `Current step does not exist: ${plan.currentStepId}`
      );
    }

    const stepIndexes = new Map(
      plan.steps.map((step, index) => [
        step.id,
        index,
      ])
    );

    for (const step of plan.steps) {
      const stepIndex =
        stepIndexes.get(step.id);

      for (const dependency of step.dependsOn ?? []) {
        const dependencyIndex =
          stepIndexes.get(dependency);

        if (dependencyIndex === undefined) {
          errors.push(
            `Step ${step.id} depends on missing step ${dependency}.`
          );
          continue;
        }

        if (
          stepIndex !== undefined &&
          dependencyIndex >= stepIndex
        ) {
          errors.push(
            `Step ${step.id} must depend only on an earlier step: ${dependency}.`
          );
        }
      }
    }

    if (this.hasDependencyCycle(plan)) {
      errors.push(
        "Plan contains a dependency cycle."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static hasDependencyCycle(
    plan: AgentPlan
  ): boolean {
    const dependencies = new Map(
      plan.steps.map((step) => [
        step.id,
        step.dependsOn ?? [],
      ])
    );

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (id: string): boolean => {
      if (visiting.has(id)) {
        return true;
      }

      if (visited.has(id)) {
        return false;
      }

      visiting.add(id);

      for (const dependency of dependencies.get(id) ?? []) {
        if (visit(dependency)) {
          return true;
        }
      }

      visiting.delete(id);
      visited.add(id);

      return false;
    };

    for (const step of plan.steps) {
      if (visit(step.id)) {
        return true;
      }
    }

    return false;
  }
}

export const agentPlanValidatorService =
  AgentPlanValidatorService;
