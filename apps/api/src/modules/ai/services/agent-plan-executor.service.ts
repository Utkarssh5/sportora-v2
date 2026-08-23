import type {
  AgentContext,
  AgentPlan,
  AgentPlanStep,
} from "../types.js";

import {
  AgentStepContractService,
} from "./agent-step-contract.service.js";

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
    plan: AgentPlan | null | undefined,
    runtimeContext?: {
      context: AgentContext;
      information?: Record<string, unknown>;
      confirmations?: Record<string, boolean>;
    }
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

      const contract =
        runtimeContext
          ? AgentStepContractService.evaluate(
              currentStep,
              runtimeContext
            )
          : AgentStepContractService.evaluate(
              currentStep,
              {
                context: {
                  user: {
                    id: "system",
                    role: "SYSTEM",
                  },
                },
              }
            );

      if (!contract.executable) {
        return null;
      }

      return currentStep;
    }

    /*
     * If the cursor is absent or already completed, find the
     * first dependency-ready executable step.
     */
    for (const step of plan.steps) {
      if (
        step.status !== "PENDING" ||
        !step.toolName
      ) {
        continue;
      }

      const dependenciesReady =
        (step.dependsOn ?? []).every(
          (dependencyId) =>
            plan.steps.some(
              (dependency) =>
                dependency.id === dependencyId &&
                dependency.status === "COMPLETED"
            )
        );

      if (!dependenciesReady) {
        continue;
      }

      const contract =
        AgentStepContractService.evaluate(
          step,
          runtimeContext ?? {
            context: {
              user: {
                id: "system",
                role: "SYSTEM",
              },
            },
          }
        );

      if (!contract.executable) {
        continue;
      }

      return step;
    }

    return null;
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
