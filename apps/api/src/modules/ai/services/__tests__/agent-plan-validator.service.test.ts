import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentPlanValidatorService,
} from "../agent-plan-validator.service.js";

import type {
  AgentPlan,
} from "../../types.js";

const validPlan: AgentPlan = {
  version: 1,
  steps: [
    {
      id: "search",
      action: "SEARCH_TOURNAMENTS",
      description: "Search tournaments.",
      status: "PENDING",
      toolName: "search_tournaments",
    },
    {
      id: "register",
      action: "REGISTER_TOURNAMENT",
      description: "Register player.",
      status: "PENDING",
      toolName: "register_for_tournament",
      dependsOn: ["search"],
    },
  ],
  currentStepId: "search",
};

describe("AgentPlanValidatorService", () => {
  it("accepts a valid plan", () => {
    expect(
      AgentPlanValidatorService.validate(
        validPlan
      )
    ).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects duplicate step ids", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          validPlan.steps[0]!,
          {
            ...validPlan.steps[1]!,
            id: "search",
          },
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Duplicate plan step id: search"
    );
  });

  it("rejects missing dependencies", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0]!,
            dependsOn: ["missing-step"],
          },
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Step search depends on missing step missing-step."
    );
  });

  it("rejects dependency cycles", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0]!,
            dependsOn: ["register"],
          },
          validPlan.steps[1]!,
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Plan contains a dependency cycle."
    );
  });

  it("rejects an invalid current step", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        currentStepId: "does-not-exist",
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Current step does not exist: does-not-exist"
    );
  });
});
