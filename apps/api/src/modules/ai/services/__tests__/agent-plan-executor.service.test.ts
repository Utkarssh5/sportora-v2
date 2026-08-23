import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentPlanExecutorService,
} from "../agent-plan-executor.service.js";

import type {
  AgentPlan,
  AgentPlanStep,
} from "../../types.js";

const step = (
  overrides: Partial<AgentPlanStep> = {}
): AgentPlanStep => ({
  id: "step-1",
  action: "SEARCH",
  description: "Search tournaments.",
  status: "PENDING",
  ...overrides,
});

describe("AgentPlanExecutorService", () => {
  it("returns the current persisted step", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "step-2",
      steps: [
        step(),
        step({
          id: "step-2",
          action: "VIEW",
          description: "View tournament.",
          toolName: "get_tournament",
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getCurrentStep(plan)?.id
    ).toBe("step-2");
  });

  it("returns null when the current step does not exist", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "missing",
      steps: [step()],
    };

    expect(
      AgentPlanExecutorService.getCurrentStep(plan)
    ).toBeNull();
  });

  it("selects a dependency-ready executable step", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "step-2",
      steps: [
        step({
          id: "step-1",
          status: "COMPLETED",
        }),
        step({
          id: "step-2",
          toolName: "get_tournament",
          dependsOn: ["step-1"],
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(plan)?.id
    ).toBe("step-2");
  });

  it("does not skip the current checkpoint to execute a later tool", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "select",
      steps: [
        step({
          id: "search",
          action: "SEARCH",
          status: "COMPLETED",
          toolName: "search_tournaments",
        }),
        step({
          id: "select",
          action: "SELECT_TOURNAMENT",
          description: "Select a tournament.",
        }),
        step({
          id: "register",
          action: "REGISTER",
          description: "Register tournament.",
          toolName: "register_for_tournament",
          dependsOn: ["select"],
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(plan)
    ).toBeNull();
  });

  it("does not execute a step whose dependency is incomplete", () => {
    const plan: AgentPlan = {
      version: 1,
      steps: [
        step({
          id: "step-1",
          status: "PENDING",
          toolName: "search_tournaments",
        }),
        step({
          id: "step-2",
          toolName: "get_tournament",
          dependsOn: ["step-1"],
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(plan)?.id
    ).toBe("step-1");
  });

  it("does not treat reasoning checkpoints as executable tools", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "select",
      steps: [
        step({
          id: "select",
          action: "SELECT_TOURNAMENT",
          description: "Select the best candidate.",
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(plan)
    ).toBeNull();

    expect(
      AgentPlanExecutorService.isExecutable(
        plan.steps[0]
      )
    ).toBe(false);
  });

  it("does not execute a step that requires user input", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "step-1",
      steps: [
        step({
          toolName: "register_for_tournament",
          requiresUserInput: true,
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(
        plan,
        {
          context: {
            user: {
              id: "player-1",
              role: "PLAYER",
            },
            conversationId: "conversation-1",
          },
        }
      )
    ).toBeNull();
  });

  it("does not execute a step when required information is missing", () => {
    const plan: AgentPlan = {
      version: 1,
      currentStepId: "step-1",
      steps: [
        step({
          toolName: "search_tournaments",
          requiredInformation: ["sport", "city"],
        }),
      ],
    };

    expect(
      AgentPlanExecutorService.getNextExecutableStep(
        plan,
        {
          context: {
            user: {
              id: "player-1",
              role: "PLAYER",
            },
            conversationId: "conversation-1",
          },
        }
      )
    ).toBeNull();
  });

  it("does not execute completed or failed steps", () => {
    const completed = step({
      status: "COMPLETED",
    });

    const failed = step({
      status: "FAILED",
    });

    expect(
      AgentPlanExecutorService.isExecutable(completed)
    ).toBe(false);

    expect(
      AgentPlanExecutorService.isExecutable(failed)
    ).toBe(false);
  });
});
