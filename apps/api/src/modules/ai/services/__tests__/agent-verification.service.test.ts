import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockFindForVerification = vi.hoisted(() => vi.fn());
const mockFindByTournamentAndUser = vi.hoisted(() => vi.fn());
const mockFindByOrderId = vi.hoisted(() => vi.fn());

vi.mock("../../../payment/repositories/payment.repository.js", () => ({
  paymentRepository: {
    findByOrderId: mockFindByOrderId,
  },
}));

vi.mock("../../../tournamentRegistration/repositories/tournamentRegistration.repository.js", () => ({
  tournamentRegistrationRepository: {
    findForVerification: mockFindForVerification,
    findByTournamentAndUser: mockFindByTournamentAndUser,
  },
}));

import {
  AgentVerificationService,
} from "../agent-verification.service.js";

import type {
  AgentContext,
  AgentGoal,
  AgentToolResult,
} from "../../types.js";

const context: AgentContext = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

describe("AgentVerificationService", () => {
  it("verifies tournament discovery when backend returns tournaments", async () => {
    const goal = {
      type: "DISCOVER_TOURNAMENT",
      status: "DISCOVERING",
      description: "Find tournaments.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: true,
      data: {
        tournaments: [
          {
            _id: "tournament-1",
            title: "Jaipur Open",
          },
        ],
      },
    };

    expect(
      await AgentVerificationService.verifyGoal(
        goal,
        "search_tournaments",
        result,
        context
      )
    ).toEqual({
      verified: true,
      reason:
        "Tournament discovery returned a verified tournament list.",
    });
  });

  it("rejects discovery without a tournament list", async () => {
    const goal = {
      type: "DISCOVER_TOURNAMENT",
      status: "DISCOVERING",
      description: "Find tournaments.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: true,
      data: {},
    };

    expect(
      (await AgentVerificationService.verifyGoal(
        goal,
        "search_tournaments",
        result,
        context
      )).verified
    ).toBe(false);
  });

  it("verifies tournament details returned by backend", async () => {
    const goal = {
      type: "VIEW_TOURNAMENT",
      status: "VIEWING_DETAILS",
      description: "View tournament.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: true,
      data: {
        tournament: {
          _id: "tournament-1",
          title: "Jaipur Open",
        },
      },
    };

    expect(
      (await AgentVerificationService.verifyGoal(
        goal,
        "get_tournament",
        result,
        context
      )).verified
    ).toBe(true);
  });

  it("never verifies registration merely because the tool succeeded", async () => {
    const goal = {
      type: "REGISTER_TOURNAMENT",
      status: "REGISTRATION",
      description: "Register player.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: true,
      data: {
        registrationId: "registration-1",
      },
    };

    const verification =
      await AgentVerificationService.verifyGoal(
        goal,
        "register_for_tournament",
        result,
        context
      );

    expect(verification.verified).toBe(false);
  });

  it("never verifies payment merely because a payment tool succeeded", async () => {
    const goal = {
      type: "PAYMENT",
      status: "PAYMENT_READY",
      description: "Complete payment.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: true,
      data: {
        orderId: "order-1",
      },
    };

    const verification =
      await AgentVerificationService.verifyGoal(
        goal,
        "create_payment_order",
        result,
        context
      );

    expect(verification.verified).toBe(false);
  });

  it("rejects failed tool results", async () => {
    const goal = {
      type: "VIEW_PROFILE",
      status: "IDLE",
      description: "View profile.",
    } as AgentGoal;

    const result: AgentToolResult = {
      success: false,
      message: "Profile not found.",
    };

    const verification =
      await AgentVerificationService.verifyGoal(
        goal,
        "get_my_profile",
        result,
        context
      );

    expect(verification.verified).toBe(false);
    expect(verification.reason).toBe(
      "Profile not found."
    );
  });
});
