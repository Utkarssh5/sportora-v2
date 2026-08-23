import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    updateAgentPlan: vi.fn(),
  },
}));

import { aiRepository } from "../../repositories/ai.repository.js";
import {
  AgentPlanService,
} from "../agent-plan.service.js";

const updateAgentPlan =
  vi.mocked(aiRepository.updateAgentPlan);

describe("AgentPlanService persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates and persists a generated plan", async () => {
    const plan =
      await AgentPlanService.createAndPersistPlan(
        "DISCOVER_TOURNAMENT",
        {
          user: {
            id: "player-1",
            role: "PLAYER",
          },
          conversationId: "conversation-1",
        }
      );

    expect(plan.steps).toHaveLength(1);

    expect(
      updateAgentPlan
    ).toHaveBeenCalledTimes(1);

    expect(
      updateAgentPlan
    ).toHaveBeenCalledWith(
      "conversation-1",
      plan
    );
  });

  it("requires conversation context for persistence", async () => {
    await expect(
      AgentPlanService.createAndPersistPlan(
        "DISCOVER_TOURNAMENT",
        {
          user: {
            id: "player-1",
            role: "PLAYER",
          },
        }
      )
    ).rejects.toThrow(
      "Conversation context is required to persist an agent plan."
    );

    expect(
      updateAgentPlan
    ).not.toHaveBeenCalled();
  });
});
