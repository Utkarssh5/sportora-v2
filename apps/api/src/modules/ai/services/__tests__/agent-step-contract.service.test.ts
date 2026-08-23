import {
  describe,
  expect,
  it,
} from "vitest";

import {
  AgentStepContractService,
} from "../agent-step-contract.service.js";

import type {
  AgentContext,
  AgentPlanStep,
} from "../../types.js";

const context: AgentContext = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

const step = (
  overrides: Partial<AgentPlanStep> = {}
): AgentPlanStep => ({
  id: "search",
  action: "SEARCH_TOURNAMENTS",
  description: "Search tournaments.",
  status: "PENDING",
  toolName: "search_tournaments",
  ...overrides,
});

describe("AgentStepContractService", () => {
  it("allows a step when its contract is satisfied", () => {
    const result =
      AgentStepContractService.evaluate(
        step({
          requiredInformation: [
            "sport",
            "city",
          ],
        }),
        {
          context,
          information: {
            sport: "Football",
            city: "Jaipur",
          },
        }
      );

    expect(result).toEqual({
      executable: true,
    });
  });

  it("blocks a step when required information is missing", () => {
    const result =
      AgentStepContractService.evaluate(
        step({
          requiredInformation: [
            "sport",
            "city",
          ],
        }),
        {
          context,
          information: {
            sport: "Football",
          },
        }
      );

    expect(result.executable).toBe(false);

    expect(result.reason).toBe(
      "Step search requires missing information: city."
    );
  });

  it("blocks a step requiring user input", () => {
    const result =
      AgentStepContractService.evaluate(
        step({
          requiresUserInput: true,
        }),
        {
          context,
        }
      );

    expect(result.executable).toBe(false);

    expect(result.reason).toBe(
      "Step search requires explicit user input."
    );
  });

  it("blocks a step when a constraint is not satisfied", () => {
    const result =
      AgentStepContractService.evaluate(
        step({
          constraints: {
            sport: "Football",
            city: "Jaipur",
          },
        }),
        {
          context,
          information: {
            sport: "Football",
            city: "Delhi",
          },
        }
      );

    expect(result.executable).toBe(false);

    expect(result.reason).toBe(
      "Step search constraint failed for city."
    );
  });

  it("allows matching constraints", () => {
    const result =
      AgentStepContractService.evaluate(
        step({
          constraints: {
            sport: "Football",
          },
        }),
        {
          context,
          information: {
            sport: "Football",
          },
        }
      );

    expect(result).toEqual({
      executable: true,
    });
  });
});
