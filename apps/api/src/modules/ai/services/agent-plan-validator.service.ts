import type {
  AgentPlan,
} from "../types.js";

export interface AgentPlanValidationResult {
  valid: boolean;
  errors: string[];
}

export class AgentPlanValidatorService {
  public static validate(
    plan: AgentPlan
  ): AgentPlanValidationResult {
    const errors: string[] = [];

    if (!Number.isInteger(plan.version) || plan.version < 1) {
      errors.push("Plan version must be a positive integer.");
    }

    if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
      errors.push("Plan must contain at least one step.");
      return { valid: false, errors };
    }

    const ids = new Set<string>();

    for (const step of plan.steps) {
      if (!step.id.trim()) {
        errors.push("Every plan step must have an id.");
      }

      if (ids.has(step.id)) {
        errors.push(`Duplicate plan step id: ${step.id}`);
      }

      ids.add(step.id);
    }

    if (
      plan.currentStepId &&
      !ids.has(plan.currentStepId)
    ) {
      errors.push(
        `Current step does not exist: ${plan.currentStepId}`
      );
    }

    for (const step of plan.steps) {
      for (const dependency of step.dependsOn ?? []) {
        if (!ids.has(dependency)) {
          errors.push(
            `Step ${step.id} depends on missing step ${dependency}.`
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
