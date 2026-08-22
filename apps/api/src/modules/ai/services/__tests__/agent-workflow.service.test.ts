import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentWorkflowService,
} from "../agent-workflow.service.js";

import type {
  AgentState,
} from "../../types.js";

function state(
  status: NonNullable<AgentState["goal"]>["status"]
): AgentState {
  return {
    activeIntent: "TOURNAMENT_REGISTRATION",
    candidateTournaments: [],
    goal: {
      type: "REGISTER_TOURNAMENT",
      status,
      description: "Register player for tournament.",
      lastObservation: "Test observation.",
    },
  };
}

describe("AgentWorkflowService", () => {
  it("asks for confirmation when registration confirmation is required", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("WAITING_CONFIRMATION")
      );

    expect(result).toEqual({
      decision: "ASK_USER",
      reason:
        "Explicit player confirmation is required before payment can proceed.",
    });
  });

  it("allows payment order creation after explicit confirmation", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("PAYMENT_READY")
      );

    expect(result.decision).toBe("CONTINUE");
    expect(result.allowedNextTool).toBe(
      "create_payment_order"
    );
  });

  it("stops while real payment is pending", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("PAYMENT_PENDING")
      );

    expect(result.decision).toBe("STOP");
  });

  it("asks the player when clarification is required", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("NEEDS_CLARIFICATION")
      );

    expect(result.decision).toBe("ASK_USER");
  });

  it("allows safe recovery after a failed action", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("FAILED")
      );

    expect(result.decision).toBe("CONTINUE");
  });

  it("stops a completed workflow", () => {
    const result =
      AgentWorkflowService.evaluate(
        state("COMPLETED")
      );

    expect(result.decision).toBe("STOP");
  });

  it("continues when there is no active goal", () => {
    const result =
      AgentWorkflowService.evaluate({});

    expect(result.decision).toBe("CONTINUE");
  });

  it("allows the evaluator-approved next tool", () => {
    const evaluation =
      AgentWorkflowService.evaluate(
        state("PAYMENT_READY")
      );

    expect(
      AgentWorkflowService.isToolAllowed(
        evaluation,
        "create_payment_order"
      )
    ).toBe(true);
  });

  it("blocks a tool that is not allowed by the evaluator", () => {
    const evaluation =
      AgentWorkflowService.evaluate(
        state("PAYMENT_READY")
      );

    expect(
      AgentWorkflowService.isToolAllowed(
        evaluation,
        "cancel_registration"
      )
    ).toBe(false);
  });

  it("allows tools when no tool restriction exists", () => {
    const evaluation =
      AgentWorkflowService.evaluate(
        state("DISCOVERING")
      );

    expect(
      AgentWorkflowService.isToolAllowed(
        evaluation,
        "search_tournaments"
      )
    ).toBe(true);
  });
});
