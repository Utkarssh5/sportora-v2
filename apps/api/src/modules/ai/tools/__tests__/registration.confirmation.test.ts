import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  confirmPendingRegistration: vi.fn(),
}));

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    confirmPendingRegistration:
      mocks.confirmPendingRegistration,
  },
}));

import {
  registrationTools,
} from "../registration.tools.js";

const requestStartedAt =
  new Date("2026-08-22T10:00:00.000Z");

function context() {
  return {
    user: {
      id: "player-1",
      role: "PLAYER",
    },
    conversationId: "conversation-1",
    requestStartedAt,
  };
}

describe("AI pending registration confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when no pending registration exists", async () => {
    mocks.confirmPendingRegistration.mockResolvedValue(
      null
    );

    const result =
      await registrationTools.confirmPendingRegistration(
        {},
        context()
      );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      "no pending tournament registration"
    );
  });

  it("rejects a pending registration created during the current turn", async () => {
    mocks.confirmPendingRegistration.mockResolvedValue(
      null
    );

    const result =
      await registrationTools.confirmPendingRegistration(
        {},
        context()
      );

    expect(result.success).toBe(false);
    expect(
      mocks.confirmPendingRegistration
    ).toHaveBeenCalledWith(
      "conversation-1",
      requestStartedAt
    );
  });

  it("confirms a pending paid registration", async () => {
    mocks.confirmPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      createdAt:
        new Date("2026-08-22T09:55:00.000Z"),
      confirmedAt:
        new Date("2026-08-22T10:01:00.000Z"),
    });

    const result =
      await registrationTools.confirmPendingRegistration(
        {},
        context()
      );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      confirmed: true,
    });
    expect(result.message).toContain(
      "payment order can now be created"
    );
  });

  it("does not confirm a pending action without a conversation id", async () => {
    const invalidContext = {
      user: {
        id: "player-1",
        role: "PLAYER",
      },
      requestStartedAt,
    };

    const result =
      await registrationTools.confirmPendingRegistration(
        {},
        invalidContext
      );

    expect(result.success).toBe(false);
    expect(
      mocks.confirmPendingRegistration
    ).not.toHaveBeenCalled();
  });
});
