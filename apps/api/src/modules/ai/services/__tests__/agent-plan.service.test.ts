import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentPlanService,
} from "../agent-plan.service.js";

describe("AgentPlanService", () => {
  it("creates a simple discovery plan", () => {
    const plan =
      AgentPlanService.createPlan(
        "DISCOVER_TOURNAMENT"
      );

    expect(plan.version).toBe(1);
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]).toMatchObject({
      id: "search-tournaments",
      action: "SEARCH_TOURNAMENTS",
      toolName: "search_tournaments",
      status: "PENDING",
    });
    expect(plan.currentStepId).toBe(
      "search-tournaments"
    );
  });

  it("creates the full registration plan", () => {
    const plan =
      AgentPlanService.createPlan(
        "REGISTER_TOURNAMENT"
      );

    expect(plan.steps.map(
      (step) => step.action
    )).toEqual([
      "SEARCH_TOURNAMENTS",
      "SELECT_TOURNAMENT",
      "GET_TOURNAMENT",
      "REGISTER_TOURNAMENT",
      "CONFIRM_PAYMENT",
      "CREATE_PAYMENT_ORDER",
      "VERIFY_PAYMENT",
      "VERIFY_REGISTRATION",
    ]);
  });

  it("keeps payment verification separate from payment order creation", () => {
    const plan =
      AgentPlanService.createPlan(
        "REGISTER_TOURNAMENT"
      );

    const paymentOrder =
      plan.steps.find(
        (step) =>
          step.action ===
          "CREATE_PAYMENT_ORDER"
      );

    const verification =
      plan.steps.find(
        (step) =>
          step.action ===
          "VERIFY_PAYMENT"
      );

    expect(paymentOrder?.toolName).toBe(
      "create_payment_order"
    );

    expect(verification?.toolName).toBeUndefined();
    expect(
      verification?.dependsOn
    ).toEqual([
      "create-payment-order",
    ]);
  });
});
