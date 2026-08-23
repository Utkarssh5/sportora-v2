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

  it("rejects dependencies that reference a later step", () => {
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
      "Step search must depend only on an earlier step: register."
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

describe("AgentPlanValidatorService semantic safety", () => {
  it("rejects an unknown planner action", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0]!,
            action: "MARK_PAYMENT_SUCCESS",
          },
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Unknown plan action: MARK_PAYMENT_SUCCESS"
    );
  });

  it("rejects a mismatched action and tool", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0]!,
            action: "SEARCH_TOURNAMENTS",
            toolName: "create_payment_order",
          },
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Plan action SEARCH_TOURNAMENTS must use tool search_tournaments."
    );
  });

  it("rejects a verification step with a tool", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            ...validPlan.steps[0]!,
            action: "VERIFY_PAYMENT",
            toolName: "create_payment_order",
          },
        ],
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Plan action VERIFY_PAYMENT must not define a toolName."
    );
  });

  it("accepts a tool-less verification checkpoint", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            id: "verify-payment",
            action: "VERIFY_PAYMENT",
            description:
              "Verify actual payment state.",
            status: "PENDING",
          },
        ],
        currentStepId: "verify-payment",
      });

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("accepts the canonical payment confirmation tool", () => {
    const result =
      AgentPlanValidatorService.validate({
        ...validPlan,
        steps: [
          {
            id: "confirm-payment",
            action: "CONFIRM_PAYMENT",
            description:
              "Confirm player intent.",
            status: "PENDING",
            toolName:
              "confirm_pending_registration",
          },
        ],
        currentStepId: "confirm-payment",
      });

    expect(result).toEqual({
      valid: true,
      errors: [],
    });
  });
});
