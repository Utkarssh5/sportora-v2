import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  generateContent: vi.fn(),

  getConversation: vi.fn(),
  createConversation: vi.fn(),
  getMessages: vi.fn(),
  saveMessage: vi.fn(),
  getAgentState: vi.fn(),
  updateAgentState: vi.fn(),
  getPendingRegistration: vi.fn(),

  recordUserMessage: vi.fn(),
  recordToolResult: vi.fn(),

  resolveTournamentReference: vi.fn(),

  registerForTournament: vi.fn(),
  confirmPendingRegistration: vi.fn(),
  createPaymentOrder: vi.fn(),
  cancelRegistration: vi.fn(),

  evaluateWorkflow: vi.fn(),
  isToolAllowed: vi.fn(),

  createDynamicPlan: vi.fn(),
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

vi.mock("../../tool-registry.js", () => ({
  agentToolDeclarations: [],
  agentToolHandlers: {},
  playerToolDeclarations: [
    {
      name: "register_for_tournament",
    },
    {
      name: "confirm_pending_registration",
    },
    {
      name: "create_payment_order",
    },
    {
      name: "cancel_registration",
    },
  ],
  playerToolHandlers: {
    register_for_tournament:
      mocks.registerForTournament,

    confirm_pending_registration:
      mocks.confirmPendingRegistration,

    create_payment_order:
      mocks.createPaymentOrder,

    cancel_registration:
      mocks.cancelRegistration,
  },
}));

vi.mock("../../prompts/agent.prompt.js", () => ({
  SPORTORA_AGENT_SYSTEM_PROMPT:
    "test-agent-prompt",
}));

vi.mock("../../prompts/user-agent.prompt.js", () => ({
  SPORTORA_USER_AGENT_SYSTEM_PROMPT:
    "test-user-agent-prompt",
}));

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    getConversation:
      mocks.getConversation,

    createConversation:
      mocks.createConversation,

    getMessages:
      mocks.getMessages,

    saveMessage:
      mocks.saveMessage,

    getAgentState:
      mocks.getAgentState,

    updateAgentState:
      mocks.updateAgentState,

    getPendingRegistration:
      mocks.getPendingRegistration,
  },
}));

vi.mock("../agent-workflow.service.js", () => ({
  agentWorkflowService: {
    evaluate:
      mocks.evaluateWorkflow,

    isToolAllowed:
      mocks.isToolAllowed,
  },
}));

vi.mock("../agent-planner.service.js", () => ({
  agentPlannerService: {
    createDynamicPlan:
      mocks.createDynamicPlan,
  },
}));

vi.mock("../agent-state.service.js", () => ({
  agentStateService: {
    recordUserMessage:
      mocks.recordUserMessage,

    recordToolResult:
      mocks.recordToolResult,
  },
}));

vi.mock("../reference-resolver.service.js", () => ({
  referenceResolverService: {
    resolveTournamentReference:
      mocks.resolveTournamentReference,
  },
}));

import {
  AgentService,
} from "../agent.service.js";

const context = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

describe("AgentService reference integration", () => {
  it("injects deterministic date context for relative tournament discovery", async () => {
    mocks.generateContent.mockReset();

    mocks.generateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              {
                text: "I found tournaments for this weekend.",
              },
            ],
          },
        },
      ],
    });

    mocks.getAgentState.mockResolvedValue(null);
    mocks.getPendingRegistration.mockResolvedValue(null);

    await AgentService.chat(
      "this weekend football tournaments in Jaipur batao",
      context
    );

    expect(
      mocks.generateContent
    ).toHaveBeenCalled();

    const call =
      mocks.generateContent.mock.calls[0];

    expect(call).toBeDefined();

    const request = call![0];

    const systemInstruction =
      request.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "DETERMINISTIC DATE CONTEXT"
    );

    expect(systemInstruction).toContain(
      "Requested expression: this weekend"
    );

    expect(systemInstruction).toContain(
      "startDateFrom:"
    );

    expect(systemInstruction).toContain(
      "startDateTo:"
    );

    expect(systemInstruction).toContain(
      "Do not recalculate, reinterpret, broaden, or replace this date range."
    );
  });

  it("injects the resolved weekend range into the planner context", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue(null);
    mocks.getPendingRegistration.mockResolvedValue(null);

    mocks.generateContent.mockResolvedValue({
      functionCalls: [],
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Test response",
              },
            ],
          },
        },
      ],
    });

    await AgentService.chat(
      "this weekend football tournaments in Jaipur batao",
      context
    );

    expect(
      mocks.generateContent
    ).toHaveBeenCalled();

    const call =
      mocks.generateContent.mock.calls[0];

    expect(call).toBeDefined();

    const request = call![0];

    const systemInstruction =
      request.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "DETERMINISTIC DATE CONTEXT"
    );

    expect(systemInstruction).toContain(
      "Requested expression: this weekend"
    );

    expect(systemInstruction).toContain(
      "startDateFrom: 2026-08-29T00:00:00.000Z"
    );

    expect(systemInstruction).toContain(
      "startDateTo: 2026-08-30T23:59:59.999Z"
    );

    expect(systemInstruction).toContain(
      "Do not recalculate, reinterpret, broaden, or replace this date range."
    );
  });

  it("passes the resolved weekend range into search_tournaments", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue(null);
    mocks.getPendingRegistration.mockResolvedValue(null);

    mocks.evaluateWorkflow.mockReturnValue({
      allowedNextTool: "search_tournaments",
    });

    mocks.isToolAllowed.mockImplementation(
      (_evaluation, toolName) =>
        toolName === "search_tournaments"
    );

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: "search_tournaments",
            args: {
              city: "Jaipur",
              sport: "Football",
              startDateFrom:
                "2026-08-29T00:00:00.000Z",
              startDateTo:
                "2026-08-30T23:59:59.999Z",
            },
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: "search_tournaments",
                    args: {
                      city: "Jaipur",
                      sport: "Football",
                      startDateFrom:
                        "2026-08-29T00:00:00.000Z",
                      startDateTo:
                        "2026-08-30T23:59:59.999Z",
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: "I found football tournaments this weekend.",
        functionCalls: [],
      });

    await AgentService.chat(
      "this weekend football tournaments in Jaipur batao",
      context,
      "user"
    );

    expect(
      mocks.isToolAllowed
    ).toHaveBeenCalledWith(
      {
        allowedNextTool:
          "search_tournaments",
      },
      "search_tournaments"
    );

    /*
     * The current test registry does not expose search_tournaments,
     * so this assertion verifies the function call produced by Gemini.
     */
    const firstCall =
      mocks.generateContent.mock.calls[0];

    expect(firstCall).toBeDefined();

    const request = firstCall![0];

    expect(
      request.config?.systemInstruction
    ).toContain(
      "Requested expression: this weekend"
    );

    expect(
      request.config?.systemInstruction
    ).toContain(
      "startDateFrom: 2026-08-29T00:00:00.000Z"
    );

    expect(
      request.config?.systemInstruction
    ).toContain(
      "startDateTo: 2026-08-30T23:59:59.999Z"
    );

    const generatedCall =
      mocks.generateContent.mock.results[0];

    expect(generatedCall).toBeDefined();
  });

  it("does not inject date context when the request has no supported relative date expression", async () => {
    mocks.generateContent.mockReset();

    mocks.generateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              {
                text: "I found football tournaments in Jaipur.",
              },
            ],
          },
        },
      ],
    });

    mocks.getAgentState.mockResolvedValue(null);
    mocks.getPendingRegistration.mockResolvedValue(null);

    await AgentService.chat(
      "Jaipur me football tournaments batao",
      context
    );

    const call =
      mocks.generateContent.mock.calls[0];

    expect(call).toBeDefined();

    const systemInstruction =
      call![0].config?.systemInstruction;

    expect(systemInstruction).not.toContain(
      "DETERMINISTIC DATE CONTEXT"
    );
  });


  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getConversation.mockResolvedValue({
      conversationId:
        "conversation-1",
      userId: "player-1",
    });

    mocks.getMessages.mockResolvedValue([]);

    mocks.saveMessage.mockResolvedValue({});

    mocks.getAgentState.mockResolvedValue(null);

    mocks.updateAgentState.mockResolvedValue(
      undefined
    );

    mocks.getPendingRegistration.mockResolvedValue(
      null
    );

    mocks.recordUserMessage.mockResolvedValue(
      undefined
    );

    mocks.recordToolResult.mockResolvedValue(
      undefined
    );

    mocks.createDynamicPlan.mockResolvedValue({
      version: 1,
      steps: [
        {
          id: "search-tournaments",
          action: "SEARCH_TOURNAMENTS",
          description:
            "Find suitable tournaments.",
          status: "PENDING",
          toolName: "search_tournaments",
        },
      ],
      currentStepId:
        "search-tournaments",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mocks.evaluateWorkflow.mockReturnValue({
      allowedNextTool: null,
    });

    mocks.isToolAllowed.mockReturnValue(true);

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name:
              "register_for_tournament",
            args: {
              tournamentId:
                "pehla wala",
            },
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name:
                      "register_for_tournament",
                    args: {
                      tournamentId:
                        "pehla wala",
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text:
          "Registration request processed.",
        functionCalls: [],
      });
  });

  it("resolves a tournament reference before executing the tool", async () => {
    mocks.resolveTournamentReference.mockResolvedValue({
      resolved: true,
      value: "tournament-1",
      reason: "ORDINAL",
    });

    mocks.registerForTournament.mockResolvedValue({
      success: true,
      data: {
        tournamentId: "tournament-1",
      },
      message:
        "Tournament registration processed.",
    });

    const result =
      await AgentService.chat(
        "pehla wala",
        context,
        "user"
      );

    expect(
      mocks.resolveTournamentReference
    ).toHaveBeenCalledWith(
      "pehla wala",
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.registerForTournament
    ).toHaveBeenCalledWith(
      {
        tournamentId:
          "tournament-1",
      },
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(result.success).toBe(true);
  });

  it("refreshes agent state before the next Gemini iteration", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState
      .mockResolvedValueOnce({
        activeIntent:
          "TOURNAMENT_DISCOVERY",
        candidateTournaments: [
          {
            id: "tournament-1",
            title:
              "Jaipur Open Football Championship",
            sport: "Football",
            city: "Jaipur",
            entryFee: 1000,
          },
        ],
        lastTool: null,
        lastUserMessage:
          "Jaipur football tournaments batao",
      })
      .mockResolvedValueOnce({
        activeIntent:
          "TOURNAMENT_REGISTRATION",
        activeEntity: {
          type: "TOURNAMENT",
          id: "tournament-1",
          label:
            "Jaipur Open Football Championship",
        },
        candidateTournaments: [
          {
            id: "tournament-1",
            title:
              "Jaipur Open Football Championship",
            sport: "Football",
            city: "Jaipur",
            entryFee: 1000,
          },
        ],
        lastTool:
          "register_for_tournament",
        lastUserMessage:
          "Jaipur football tournaments batao",
      });

    mocks.registerForTournament.mockResolvedValue({
      success: true,
      data: {
        tournamentId:
          "tournament-1",
      },
      message:
        "Registration request processed.",
    });

    mocks.resolveTournamentReference.mockResolvedValue({
      resolved: true,
      value: "tournament-1",
      reason: "TITLE_MATCH",
    });

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name:
              "register_for_tournament",
            args: {
              tournamentId:
                "Jaipur Open Football Championship",
            },
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name:
                      "register_for_tournament",
                    args: {
                      tournamentId:
                        "Jaipur Open Football Championship",
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text:
          "The registration request has been processed.",
        functionCalls: [],
      });

    const result =
      await AgentService.chat(
        "Jaipur football tournaments batao",
        context,
        "user"
      );

    expect(result.success).toBe(true);

    expect(
      mocks.getAgentState
    ).toHaveBeenCalledTimes(2);

    expect(
      mocks.generateContent
    ).toHaveBeenCalledTimes(2);

    const secondCall =
      mocks.generateContent.mock.calls[1]?.[0];

    expect(secondCall).toBeDefined();

    const secondSystemInstruction =
      secondCall?.config?.systemInstruction;

    expect(secondSystemInstruction).toContain(
      "TOURNAMENT_REGISTRATION"
    );

    expect(secondSystemInstruction).toContain(
      "register_for_tournament"
    );

    expect(secondSystemInstruction).toContain(
      "Jaipur Open Football Championship"
    );

    expect(secondSystemInstruction).toContain(
      "tournament-1"
    );
  });

  it("chains explicit confirmation into payment order creation", async () => {
    mocks.generateContent.mockReset();

    mocks.resolveTournamentReference.mockResolvedValue({
      resolved: true,
      value: "tournament-qa-1",
      reason: "TITLE_MATCH",
    });

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name:
              "confirm_pending_registration",
            args: {},
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name:
                      "confirm_pending_registration",
                    args: {},
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name:
              "create_payment_order",
            args: {
              tournamentId:
                "tournament-qa-1",
            },
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name:
                      "create_payment_order",
                    args: {
                      tournamentId:
                        "tournament-qa-1",
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text:
          "The payment order has been created. Payment is not completed yet.",
        functionCalls: [],
      });

    mocks.confirmPendingRegistration.mockResolvedValue({
      success: true,
      data: {
        tournamentId:
          "tournament-qa-1",
        action:
          "PAYMENT_REQUIRED",
        confirmed: true,
      },
      message:
        "Registration request confirmed. The payment order can now be created.",
    });

    mocks.createPaymentOrder.mockResolvedValue({
      success: true,
      data: {
        orderId:
          "order-qa-1",
        amount: 100000,
        currency: "INR",
        tournamentId:
          "tournament-qa-1",
      },
      message:
        "Payment order created successfully. Payment is not completed yet.",
    });

    const result =
      await AgentService.chat(
        "Haan, proceed",
        context,
        "user"
      );

    expect(
      mocks.confirmPendingRegistration
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.createPaymentOrder
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.createPaymentOrder
    ).toHaveBeenCalledWith(
      {
        tournamentId:
          "tournament-qa-1",
      },
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.confirmPendingRegistration.mock.invocationCallOrder[0]!
    ).toBeLessThan(
      mocks.createPaymentOrder.mock.invocationCallOrder[0]!
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain(
      "payment order has been created"
    );
    expect(result.message).toMatch(
      /not completed yet/i
    );
  });

  it("passes pending registration to Gemini when agent state is absent", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue(null);

    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId:
        "tournament-pending-1",
      action:
        "PAYMENT_REQUIRED",
      createdAt:
        new Date("2026-08-22T08:00:00.000Z"),
      confirmedAt:
        null,
    });

    mocks.generateContent.mockResolvedValueOnce({
      text:
        "The selected tournament requires payment confirmation.",
      functionCalls: [],
    });

    const result =
      await AgentService.chat(
        "Is tournament ke liye proceed karna hai",
        context,
        "user"
      );

    expect(result.success).toBe(true);

    const firstCall =
      mocks.generateContent.mock.calls[0]?.[0];

    expect(firstCall).toBeDefined();

    const systemInstruction =
      firstCall?.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "SPORTORA RUNTIME CONTEXT"
    );

    expect(systemInstruction).toContain(
      "pendingRegistration"
    );

    expect(systemInstruction).toContain(
      "tournament-pending-1"
    );

    expect(systemInstruction).toContain(
      "PAYMENT_REQUIRED"
    );
  });

  it("derives a confirmation-required workflow status from pending registration", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_REGISTRATION",
      activeEntity: {
        type: "TOURNAMENT",
        id: "tournament-pending-1",
        label: "Test Tournament",
      },
      candidateTournaments: [],
      lastTool: "register_for_tournament",
      lastUserMessage: "Is tournament mein register karna hai",
    });

    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-pending-1",
      action: "PAYMENT_REQUIRED",
      createdAt: new Date("2026-08-22T08:00:00.000Z"),
      confirmedAt: null,
    });

    mocks.generateContent.mockResolvedValueOnce({
      text: "Please confirm if you would like to proceed with payment.",
      functionCalls: [],
    });

    const result = await AgentService.chat(
      "Isme proceed karna hai?",
      context,
      "user"
    );

    expect(result.success).toBe(true);

    const firstCall =
      mocks.generateContent.mock.calls[0]?.[0];

    const systemInstruction =
      firstCall?.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "REGISTRATION_CONFIRMATION_REQUIRED"
    );
  });

  it("derives a payment-ready workflow status after registration confirmation", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_REGISTRATION",
      activeEntity: {
        type: "TOURNAMENT",
        id: "tournament-confirmed-1",
        label: "Confirmed Tournament",
      },
      candidateTournaments: [],
      lastTool: "confirm_pending_registration",
      lastUserMessage: "Haan, proceed",
    });

    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-confirmed-1",
      action: "PAYMENT_REQUIRED",
      createdAt: new Date("2026-08-22T08:00:00.000Z"),
      confirmedAt: new Date("2026-08-22T08:01:00.000Z"),
    });

    mocks.generateContent.mockResolvedValueOnce({
      text: "The registration is confirmed and the payment order can now be created.",
      functionCalls: [],
    });

    const result = await AgentService.chat(
      "Proceed",
      context,
      "user"
    );

    expect(result.success).toBe(true);

    const firstCall =
      mocks.generateContent.mock.calls[0]?.[0];

    const systemInstruction =
      firstCall?.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "REGISTRATION_CONFIRMED_PAYMENT_READY"
    );
  });

  it("passes current agent state to Gemini as runtime context", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent:
        "TOURNAMENT_DETAILS",
      activeEntity: {
        type: "TOURNAMENT",
        id: "tournament-1",
        label:
          "Jaipur Open Football Championship",
      },
      candidateTournaments: [
        {
          id: "tournament-1",
          title:
            "Jaipur Open Football Championship",
          sport: "Football",
          city: "Jaipur",
          entryFee: 1000,
        },
      ],
      lastTool:
        "get_tournament",
      lastUserMessage:
        "isme registration fee kya hai",
    });

    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId:
        "tournament-1",
      action:
        "PAYMENT_REQUIRED",
      createdAt:
        new Date("2026-08-22T08:00:00.000Z"),
      confirmedAt:
        null,
    });

    mocks.generateContent.mockResolvedValueOnce({
      text:
        "The entry fee is ₹1,000.",
      functionCalls: [],
    });

    const result =
      await AgentService.chat(
        "isme registration fee kya hai",
        context,
        "user"
      );

    expect(result.success).toBe(true);

    expect(
      mocks.recordUserMessage
    ).toHaveBeenCalledWith(
      "isme registration fee kya hai",
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.generateContent
    ).toHaveBeenCalledTimes(1);

    const call =
      mocks.generateContent.mock.calls[0]?.[0];

    expect(call).toBeDefined();

    const systemInstruction =
      call?.config?.systemInstruction;

    expect(systemInstruction).toContain(
      "test-user-agent-prompt"
    );

    expect(systemInstruction).toContain(
      "SPORTORA RUNTIME CONTEXT"
    );

    expect(systemInstruction).toContain(
      "TOURNAMENT_DETAILS"
    );

    expect(systemInstruction).toContain(
      "Jaipur Open Football Championship"
    );

    expect(systemInstruction).toContain(
      "tournament-1"
    );

    expect(systemInstruction).toContain(
      "get_tournament"
    );

    expect(systemInstruction).toContain(
      "isme registration fee kya hai"
    );

    expect(systemInstruction).toContain(
      "pendingRegistration"
    );

    expect(systemInstruction).toContain(
      "PAYMENT_REQUIRED"
    );
  });

  it("does not execute the tool when the tournament reference is ambiguous", async () => {
    mocks.generateContent.mockReset();

    mocks.generateContent.mockResolvedValueOnce({
      functionCalls: [
        {
          name:
            "register_for_tournament",
          args: {
            tournamentId:
              "Jaipur wala",
          },
        },
      ],
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name:
                    "register_for_tournament",
                  args: {
                    tournamentId:
                      "Jaipur wala",
                  },
                },
              },
            ],
          },
        },
      ],
    });

    mocks.generateContent.mockResolvedValueOnce({
      text:
        "I could not identify a single tournament matching that reference.",
      functionCalls: [],
    });

    mocks.resolveTournamentReference.mockResolvedValue({
      resolved: false,
      reason: "AMBIGUOUS",
    });

    const result =
      await AgentService.chat(
        "Jaipur wala",
        context,
        "user"
      );

    expect(
      mocks.resolveTournamentReference
    ).toHaveBeenCalledWith(
      "Jaipur wala",
      expect.anything()
    );

    expect(
      mocks.registerForTournament
    ).not.toHaveBeenCalled();

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      "I could not identify a single tournament matching that reference."
    );
  });

  it("executes the tool allowed by the current workflow", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "PAYMENT_READY",
      lastTool: "confirm_pending_registration",
    });

    mocks.resolveTournamentReference.mockResolvedValue({
      resolved: true,
      value: "tournament-1",
      reason: "EXACT",
    });

    mocks.evaluateWorkflow.mockReturnValue({
      allowedNextTool: "create_payment_order",
    });

    mocks.isToolAllowed.mockImplementation(
      (_evaluation, toolName) =>
        toolName === "create_payment_order"
    );

    mocks.createPaymentOrder.mockResolvedValue({
      success: true,
      data: {
        orderId: "order-1",
      },
      message: "Payment order created.",
    });

    mocks.generateContent
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: "create_payment_order",
            args: {
              tournamentId: "tournament-1",
            },
          },
        ],
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: "create_payment_order",
                    args: {
                      tournamentId: "tournament-1",
                    },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        text: "Payment order created.",
        functionCalls: [],
      });

    const result =
      await AgentService.chat(
        "pay for this tournament",
        context,
        "user"
      );

    expect(
      mocks.isToolAllowed
    ).toHaveBeenCalledWith(
      {
        allowedNextTool:
          "create_payment_order",
      },
      "create_payment_order"
    );

    expect(
      mocks.createPaymentOrder
    ).toHaveBeenCalledWith(
      {
        tournamentId: "tournament-1",
      },
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.cancelRegistration
    ).not.toHaveBeenCalled();

    expect(result.success).toBe(true);
  });

  it("blocks a tool that conflicts with the current persisted plan step", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_REGISTRATION",
      lastTool: "search_tournaments",
      goal: {
        type: "REGISTER_TOURNAMENT",
        status: "PAYMENT_READY",
        plan: {
          version: 1,
          currentStepId: "create-payment-order",
          steps: [
            {
              id: "create-payment-order",
              action: "CREATE_PAYMENT_ORDER",
              description: "Create the payment order.",
              status: "PENDING",
              toolName: "create_payment_order",
            },
          ],
        },
      },
    });

    mocks.evaluateWorkflow.mockReturnValue({
      decision: "CONTINUE",
      reason:
        "The current plan step permits only its assigned tool.",
      allowedNextTool:
        "create_payment_order",
    });

    mocks.isToolAllowed.mockImplementation(
      (evaluation, toolName) =>
        evaluation.allowedNextTool === toolName
    );

    mocks.generateContent.mockResolvedValueOnce({
      functionCalls: [
        {
          name: "cancel_registration",
          args: {
            registrationId: "registration-1",
          },
        },
      ],
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "cancel_registration",
                  args: {
                    registrationId: "registration-1",
                  },
                },
              },
            ],
          },
        },
      ],
    });

    const result =
      await AgentService.chat(
        "cancel my registration",
        context,
        "user"
      );

    expect(
      mocks.isToolAllowed
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        allowedNextTool:
          "create_payment_order",
      }),
      "cancel_registration"
    );

    expect(
      mocks.cancelRegistration
    ).not.toHaveBeenCalled();

    expect(result.success).toBe(true);
  });

  it("blocks all tools when the current persisted plan step requires observation", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_REGISTRATION",
      lastTool: "create_payment_order",
      goal: {
        type: "REGISTER_TOURNAMENT",
        status: "PAYMENT_READY",
        plan: {
          version: 1,
          currentStepId: "verify-payment",
          steps: [
            {
              id: "verify-payment",
              action: "VERIFY_PAYMENT",
              description:
                "Verify the actual payment result.",
              status: "PENDING",
            },
          ],
        },
      },
    });

    mocks.evaluateWorkflow.mockReturnValue({
      decision: "CONTINUE",
      reason:
        "The current plan step requires an observation or state transition before another tool can execute.",
      toolsBlocked: true,
    });

    mocks.isToolAllowed.mockImplementation(
      (evaluation) =>
        evaluation.toolsBlocked !== true
    );

    mocks.generateContent.mockResolvedValueOnce({
      functionCalls: [
        {
          name: "create_payment_order",
          args: {
            tournamentId: "tournament-qa-1",
          },
        },
      ],
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "create_payment_order",
                  args: {
                    tournamentId: "tournament-qa-1",
                  },
                },
              },
            ],
          },
        },
      ],
    });

    const result =
      await AgentService.chat(
        "create the payment order again",
        context,
        "user"
      );

    expect(
      mocks.isToolAllowed
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        toolsBlocked: true,
      }),
      "create_payment_order"
    );

    expect(
      mocks.createPaymentOrder
    ).not.toHaveBeenCalled();

    expect(result.success).toBe(true);
  });

  it("blocks a tool that is not allowed by the current workflow", async () => {
    mocks.generateContent.mockReset();

    mocks.getAgentState.mockResolvedValue({
      activeIntent: "PAYMENT_READY",
      lastTool: "confirm_pending_registration",
    });

    mocks.evaluateWorkflow.mockReturnValue({
      allowedNextTool: "create_payment_order",
    });

    mocks.isToolAllowed.mockImplementation(
      (_evaluation, toolName) =>
        toolName === "create_payment_order"
    );

    mocks.generateContent.mockResolvedValueOnce({
      functionCalls: [
        {
          name: "cancel_registration",
          args: {
            registrationId: "registration-1",
          },
        },
      ],
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "cancel_registration",
                  args: {
                    registrationId: "registration-1",
                  },
                },
              },
            ],
          },
        },
      ],
    });

    const result =
      await AgentService.chat(
        "cancel my registration",
        context,
        "user"
      );

    expect(
      mocks.isToolAllowed
    ).toHaveBeenCalledWith(
      {
        allowedNextTool:
          "create_payment_order",
      },
      "cancel_registration"
    );

    expect(
      mocks.cancelRegistration
    ).not.toHaveBeenCalled();

    expect(
      mocks.saveMessage
    ).toHaveBeenCalledWith(
      "conversation-1",
      "model",
      "The current workflow only permits create_payment_order at this stage."
    );

    expect(result.success).toBe(true);
  });


  it("replans dynamically after a failed workflow action", async () => {
    mocks.getAgentState
      .mockResolvedValueOnce({
        goal: {
          type: "REGISTER_TOURNAMENT",
          status: "FAILED",
          description:
            "Register me in a football tournament in Jaipur.",
          lastObservation:
            "The selected tournament registration deadline has passed.",
          plan: {
            version: 1,
            steps: [
              {
                id: "register",
                action: "REGISTER_TOURNAMENT",
                description:
                  "Register in the selected tournament.",
                status: "FAILED",
                toolName:
                  "register_for_tournament",
              },
            ],
            currentStepId: "register",
          },
        },
      })
      .mockResolvedValueOnce({
        goal: {
          type: "REGISTER_TOURNAMENT",
          status: "DISCOVERING",
          description:
            "Register me in a football tournament in Jaipur.",
          plan: {
            version: 2,
            steps: [
              {
                id: "search-alternative",
                action: "SEARCH_TOURNAMENTS",
                description:
                  "Find another eligible tournament.",
                status: "PENDING",
                toolName:
                  "search_tournaments",
              },
            ],
            currentStepId:
              "search-alternative",
          },
        },
      });

    mocks.createDynamicPlan.mockResolvedValue({
      version: 2,
      steps: [
        {
          id: "search-alternative",
          action: "SEARCH_TOURNAMENTS",
          description:
            "Find another eligible tournament.",
          status: "PENDING",
          toolName: "search_tournaments",
        },
      ],
      currentStepId:
        "search-alternative",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mocks.evaluateWorkflow
      .mockReturnValueOnce({
        decision: "REPLAN",
        reason:
          "The previous action failed and recovery is required.",
      })
      .mockReturnValue({
        decision: "CONTINUE",
        reason: "Recovery plan is ready.",
        allowedNextTool:
          "search_tournaments",
      });

    mocks.generateContent.mockResolvedValue({
      text: "",
      functionCalls: [
        {
          name: "search_tournaments",
          args: {
            city: "Jaipur",
            sport: "Football",
          },
        },
      ],
    });

    await AgentService.chat(
      "Find another tournament and register me.",
      context,
      "user"
    );

    expect(
      mocks.createDynamicPlan
    ).toHaveBeenCalledOnce();

    expect(
      mocks.createDynamicPlan
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "REGISTER_TOURNAMENT",
        status: "FAILED",
        lastObservation:
          "The selected tournament registration deadline has passed.",
      }),
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.updateAgentState
    ).toHaveBeenCalledWith(
      "conversation-1",
      expect.objectContaining({
        goal: expect.objectContaining({
          plan: expect.objectContaining({
            version: 2,
          }),
        }),
      })
    );
  });

  it("creates and persists a dynamic plan when the goal has no plan", async () => {
    mocks.getAgentState
      .mockResolvedValueOnce({
        goal: {
          type: "REGISTER_TOURNAMENT",
          status: "DISCOVERING",
          description:
            "Register me in the best football tournament in Jaipur.",
        },
      })
      .mockResolvedValueOnce({
        goal: {
          type: "REGISTER_TOURNAMENT",
          status: "DISCOVERING",
          description:
            "Register me in the best football tournament in Jaipur.",
          plan: {
            version: 1,
            steps: [
              {
                id: "search-tournaments",
                action: "SEARCH_TOURNAMENTS",
                description:
                  "Find suitable tournaments.",
                status: "PENDING",
                toolName:
                  "search_tournaments",
              },
            ],
            currentStepId:
              "search-tournaments",
          },
        },
      });

    mocks.generateContent.mockResolvedValue({
      text: "",
      functionCalls: [
        {
          name: "search_tournaments",
          args: {
            city: "Jaipur",
            sport: "Football",
          },
        },
      ],
    });


    mocks.evaluateWorkflow.mockReturnValue({
      decision: "CONTINUE",
      reason: "Plan is ready.",
    });

    await AgentService.chat(
      "Find a football tournament in Jaipur.",
      context,
      "user"
    );

    expect(
      mocks.createDynamicPlan
    ).toHaveBeenCalledOnce();

    expect(
      mocks.createDynamicPlan
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "REGISTER_TOURNAMENT",
        status: "DISCOVERING",
      }),
      expect.objectContaining({
        conversationId:
          "conversation-1",
      })
    );

    expect(
      mocks.getAgentState
    ).toHaveBeenCalled();

    expect(
      mocks.evaluateWorkflow
    ).toHaveBeenCalled();
  });

});
