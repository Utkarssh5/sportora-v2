import type {
  AgentPlan,
  AgentPlanStep,
} from "../types.js";

export class AgentPlanExecutorService {
  public static getCurrentStep(
    plan: AgentPlan | null | undefined
  ): AgentPlanStep | null {
    if (!plan?.currentStepId) {
      return null;
    }

    return (
      plan.steps.find(
        (step) => step.id === plan.currentStepId
      ) ?? null
    );
  }

  public static getNextExecutableStep(
    plan: AgentPlan | null | undefined
  ): AgentPlanStep | null {
    if (!plan) {
      return null;
    }

    const currentStep =
      this.getCurrentStep(plan);

    /*
     * The persisted cursor is authoritative.
     * Never skip over a current reasoning/checkpoint step
     * and execute a later tool.
     */
    if (
      currentStep &&
      currentStep.status === "PENDING"
    ) {
      if (
        !currentStep.toolName ||
        !(currentStep.dependsOn ?? []).every(
          (dependencyId) =>
            plan.steps.some(
              (dependency) =>
                dependency.id === dependencyId &&
                dependency.status === "COMPLETED"
            )
        )
      ) {
        return null;
      }

      return currentStep;
    }

    /*
     * If the cursor is absent or already completed, find the
     * first dependency-ready executable step.
     */
    return (
      plan.steps.find(
        (step) =>
          step.status === "PENDING" &&
          Boolean(step.toolName) &&
          (step.dependsOn ?? []).every(
            (dependencyId) =>
              plan.steps.some(
                (dependency) =>
                  dependency.id === dependencyId &&
                  dependency.status === "COMPLETED"
              )
          )
      ) ?? null
    );
  }

  public static isExecutable(
    step: AgentPlanStep | null | undefined
  ): boolean {
    return Boolean(
      step &&
      step.status === "PENDING" &&
      step.toolName
    );
  }
}

export const agentPlanExecutorService =
  AgentPlanExecutorService;
