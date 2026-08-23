import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    updateAgentState: vi.fn(),
    getAgentState: vi.fn().mockResolvedValue(null),
  },
}));

import { aiRepository } from "../../repositories/ai.repository.js";
import { agentStateService } from "../agent-state.service.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../../types.js";

const updateAgentState =
  vi.mocked(aiRepository.updateAgentState);

const context: AgentContext = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

describe("AgentStateService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(aiRepository.getAgentState)
      .mockResolvedValue(null);
  });

  it("stores tournament candidates after search", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        tournaments: [
          {
            _id: "tournament-1",
            title: "Jaipur Open Football Championship",
            sport: "Football",
            city: "Jaipur",
            entryFee: 1000,
          },
          {
            _id: "tournament-2",
            title: "Jaipur Football Cup",
            sport: "Football",
            city: "Jaipur",
            entryFee: 500,
          },
        ],
      },
    };

    await agentStateService.recordToolResult(
      "search_tournaments",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        activeIntent: "TOURNAMENT_DISCOVERY",
        candidateTournaments: [
          {
            id: "tournament-1",
            title: "Jaipur Open Football Championship",
            sport: "Football",
            city: "Jaipur",
            entryFee: 1000,
          },
          {
            id: "tournament-2",
            title: "Jaipur Football Cup",
            sport: "Football",
            city: "Jaipur",
            entryFee: 500,
          },
        ],
        goal: expect.objectContaining({
          type: "DISCOVER_TOURNAMENT",
          status: "DISCOVERING",
          completedSteps: ["SEARCH_TOURNAMENTS"],
        }),
        lastTool: "search_tournaments",
      }
    );
  });

  it("advances the existing registration plan after a successful tool", async () => {
    vi.mocked(aiRepository.getAgentState).mockResolvedValueOnce({
      goal: {
        type: "REGISTER_TOURNAMENT",
        status: "DISCOVERING",
        description: "Register for a tournament",
        plan: {
          version: 1,
          steps: [
            {
              id: "search-tournaments",
              action: "SEARCH_TOURNAMENTS",
              description: "Find tournaments",
              status: "PENDING",
              toolName: "search_tournaments",
            },
            {
              id: "select-tournament",
              action: "SELECT_TOURNAMENT",
              description: "Select a tournament",
              status: "PENDING",
            },
            {
              id: "get-tournament",
              action: "GET_TOURNAMENT",
              description: "Verify tournament",
              status: "PENDING",
              toolName: "get_tournament",
              dependsOn: [
                "search-tournaments",
                "select-tournament",
              ],
            },
          ],
          currentStepId: "search-tournaments",
        },
      },
    } as never);

    const result: AgentToolResult = {
      success: true,
      data: {
        tournaments: [],
      },
    };

    await agentStateService.recordToolResult(
      "search_tournaments",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      expect.objectContaining({
        goal: expect.objectContaining({
          plan: expect.objectContaining({
            currentStepId: "select-tournament",
            steps: expect.arrayContaining([
              expect.objectContaining({
                id: "search-tournaments",
                status: "COMPLETED",
              }),
              expect.objectContaining({
                id: "select-tournament",
                status: "PENDING",
              }),
            ]),
          }),
        }),
      })
    );
  });

  it("does not treat payment order creation as payment verification", async () => {
    vi.mocked(aiRepository.getAgentState).mockResolvedValueOnce({
      goal: {
        type: "REGISTER_TOURNAMENT",
        status: "PAYMENT_READY",
        description: "Register for a tournament",
        plan: {
          version: 1,
          steps: [
            {
              id: "create-payment-order",
              action: "CREATE_PAYMENT_ORDER",
              description: "Create payment order",
              status: "PENDING",
              toolName: "create_payment_order",
            },
            {
              id: "verify-payment",
              action: "VERIFY_PAYMENT",
              description: "Verify payment",
              status: "PENDING",
              dependsOn: ["create-payment-order"],
            },
          ],
          currentStepId: "create-payment-order",
        },
      },
    } as never);

    const result: AgentToolResult = {
      success: true,
      data: {
        tournamentId: "tournament-1",
        orderId: "order-1",
      },
    };

    await agentStateService.recordToolResult(
      "create_payment_order",
      result,
      context
    );

    const call = vi.mocked(updateAgentState).mock.calls[0]?.[1];

    expect(call?.goal?.plan).toEqual(
      expect.objectContaining({
        currentStepId: "verify-payment",
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: "create-payment-order",
            status: "COMPLETED",
          }),
          expect.objectContaining({
            id: "verify-payment",
            status: "PENDING",
          }),
        ]),
      })
    );
  });

  it("stores the active tournament after get_tournament", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        _id: "tournament-1",
        title: "Jaipur Open Football Championship",
      },
    };

    await agentStateService.recordToolResult(
      "get_tournament",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        activeIntent: "TOURNAMENT_DETAILS",
        activeEntity: {
          type: "TOURNAMENT",
          id: "tournament-1",
          label: "Jaipur Open Football Championship",
        },
        goal: expect.objectContaining({
          type: "VIEW_TOURNAMENT",
          status: "VIEWING_DETAILS",
          completedSteps: ["GET_TOURNAMENT"],
        }),
        lastTool: "get_tournament",
      }
    );
  });

  it("stores registration intent", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        tournamentId: "tournament-1",
        entryFee: 1000,
        confirmationRequired: true,
      },
    };

    await agentStateService.recordToolResult(
      "register_for_tournament",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        activeIntent: "TOURNAMENT_REGISTRATION",
        activeEntity: {
          type: "TOURNAMENT",
          id: "tournament-1",
        },
        goal: expect.objectContaining({
          type: "REGISTER_TOURNAMENT",
          status: "WAITING_CONFIRMATION",
          pendingAction: "CONFIRM_PAYMENT",
          completedSteps: [
            "SELECT_TOURNAMENT",
            "REGISTRATION_REQUEST",
          ],
        }),
        lastTool: "register_for_tournament",
      }
    );
  });

  it("keeps payment order creation inside the registration goal", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        tournamentId: "tournament-1",
        orderId: "order-1",
      },
    };

    await agentStateService.recordToolResult(
      "create_payment_order",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        activeIntent: "TOURNAMENT_REGISTRATION",
        activeEntity: {
          type: "TOURNAMENT",
          id: "tournament-1",
        },
        goal: expect.objectContaining({
          type: "REGISTER_TOURNAMENT",
          status: "PAYMENT_PENDING",
          pendingAction: "COMPLETE_PAYMENT",
          completedSteps: [
            "SELECT_TOURNAMENT",
            "REGISTRATION_REQUEST",
            "PAYMENT_CONFIRMATION",
            "PAYMENT_ORDER_CREATED",
          ],
        }),
        lastTool: "create_payment_order",
      }
    );
  });

  it("stores a clarification state for a failed tool", async () => {
    vi.mocked(aiRepository.getAgentState).mockResolvedValueOnce({
      activeIntent: "TOURNAMENT_DETAILS",
      candidateTournaments: [] as any,
      goal: {
        type: "VIEW_TOURNAMENT",
        status: "VIEWING_DETAILS",
        description:
          "Understand the selected tournament.",
        constraints: {},
        requiredInformation: [],
        completedSteps: [],
      },
    });

    const result: AgentToolResult = {
      success: false,
      message: "Tournament not found.",
    };

    await agentStateService.recordToolResult(
      "get_tournament",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      expect.objectContaining({
        activeIntent: "TOURNAMENT_DETAILS",
        goal: expect.objectContaining({
          type: "VIEW_TOURNAMENT",
          status: "NEEDS_CLARIFICATION",
          lastObservation: "Tournament not found.",
          pendingAction: "CLARIFY",
        }),
        lastTool: "get_tournament",
      })
    );
  });

  it("does not update state without conversation context", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        tournaments: [],
      },
    };

    await agentStateService.recordToolResult(
      "search_tournaments",
      result,
      {
        user: {
          id: "player-1",
          role: "PLAYER",
        },
      }
    );

    expect(updateAgentState).not.toHaveBeenCalled();
  });

  it("stores the latest user message in agent state", async () => {
    await agentStateService.recordUserMessage(
      "  Jaipur mein football tournaments batao  ",
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        lastUserMessage:
          "Jaipur mein football tournaments batao",
      }
    );
  });

  it("stores match intent for match tools", async () => {
    const result: AgentToolResult = {
      success: true,
      data: {
        matchId: "match-1",
      },
    };

    await agentStateService.recordToolResult(
      "get_match_details",
      result,
      context
    );

    expect(updateAgentState).toHaveBeenCalledWith(
      "conversation-1",
      {
        activeIntent: "MATCH",
        goal: expect.objectContaining({
          type: "CHECK_MATCH",
          status: "COMPLETED",
          completedSteps: ["GET_MATCH_INFORMATION"],
        }),
        lastTool: "get_match_details",
      }
    );
  });
});
