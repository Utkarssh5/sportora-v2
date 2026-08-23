import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
}));

vi.mock("../gemini.service.js", () => ({
  gemini: {
    models: {
      generateContent:
        mocks.generateContent,
    },
  },
  GEMINI_MODEL: "test-model",
}));

import {
  AgentPlannerService,
} from "../agent-planner.service.js";

const context = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

const goal = {
  type: "REGISTER_TOURNAMENT" as const,
  status: "DISCOVERING" as const,
  description:
    "Register me in the best football tournament in Jaipur.",
  constraints: {
    sport: "Football",
    city: "Jaipur",
  },
  requiredInformation: [
    "sport",
    "city",
  ],
  completedSteps: [
    "UNDERSTAND_REQUEST",
  ],
  pendingAction: "SEARCH_TOURNAMENTS",
  lastObservation:
    "No previous observation.",
};

describe("AgentPlannerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a valid dynamic plan from Gemini output", async () => {
    mocks.generateContent.mockResolvedValue({
      text: JSON.stringify({
        version: 1,
        steps: [
          {
            id: "search-tournaments",
            action: "SEARCH_TOURNAMENTS",
            description:
              "Find suitable football tournaments in Jaipur.",
            status: "PENDING",
            toolName: "search_tournaments",
          },
          {
            id: "select-tournament",
            action: "SELECT_TOURNAMENT",
            description:
              "Select the best eligible tournament.",
            status: "PENDING",
            dependsOn: [
              "search-tournaments",
            ],
          },
          {
            id: "get-tournament",
            action: "GET_TOURNAMENT",
            description:
              "Verify the selected tournament details.",
            status: "PENDING",
            toolName: "get_tournament",
            dependsOn: [
              "search-tournaments",
              "select-tournament",
            ],
          },
        ],
        currentStepId:
          "search-tournaments",
      }),
    });

    const plan =
      await AgentPlannerService.createDynamicPlan(
        goal,
        context
      );

    expect(plan.version).toBe(1);
    expect(plan.steps).toHaveLength(3);
    expect(plan.currentStepId).toBe(
      "search-tournaments"
    );

    expect(
      plan.steps[0]!.toolName
    ).toBe("search_tournaments");

    expect(
      mocks.generateContent
    ).toHaveBeenCalledOnce();

    const plannerRequest =
      mocks.generateContent.mock.calls[0]![0];

    const requestText =
      plannerRequest.contents[0].parts[0].text;

    expect(requestText).toContain(
      '"lastObservation"'
    );

    expect(requestText).toContain(
      '"completedSteps"'
    );
  });

  it("rejects invalid planner JSON", async () => {
    mocks.generateContent.mockResolvedValue({
      text: "{invalid-json}",
    });

    await expect(
      AgentPlannerService.createDynamicPlan(
        goal,
        context
      )
    ).rejects.toThrow(
      "Planner returned invalid JSON."
    );
  });

  it("rejects a planner attempt to claim payment success", async () => {
    mocks.generateContent.mockResolvedValue({
      text: JSON.stringify({
        version: 1,
        steps: [
          {
            id: "payment-success",
            action: "MARK_PAYMENT_SUCCESS",
            description: "Mark payment as successful.",
            status: "PENDING",
          },
        ],
        currentStepId: "payment-success",
      }),
    });

    await expect(
      AgentPlannerService.createDynamicPlan(
        goal,
        context
      )
    ).rejects.toThrow(
      "Invalid dynamic agent plan:"
    );
  });

  it("rejects an invalid plan", async () => {
    mocks.generateContent.mockResolvedValue({
      text: JSON.stringify({
        version: 1,
        steps: [
          {
            id: "step-a",
            action: "SEARCH_TOURNAMENTS",
            description: "Search.",
            status: "PENDING",
            dependsOn: [
              "missing-step",
            ],
          },
        ],
        currentStepId: "step-a",
      }),
    });

    await expect(
      AgentPlannerService.createDynamicPlan(
        goal,
        context
      )
    ).rejects.toThrow(
      "Invalid dynamic agent plan:"
    );
  });

  it("rejects an empty Gemini response", async () => {
    mocks.generateContent.mockResolvedValue({
      text: "",
    });

    await expect(
      AgentPlannerService.createDynamicPlan(
        goal,
        context
      )
    ).rejects.toThrow(
      "Planner returned an empty response."
    );
  });
});
