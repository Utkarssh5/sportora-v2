import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getPendingRegistration: vi.fn(),
  clearPendingRegistration: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    getPendingRegistration:
      mocks.getPendingRegistration,
    clearPendingRegistration:
      mocks.clearPendingRegistration,
  },
}));

vi.mock("../../../payment/services/payment.service.js", () => ({
  paymentService: {
    createOrder: mocks.createOrder,
  },
}));

import { paymentTools } from "../payment.tools.js";

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

describe("AI payment confirmation guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks payment when there is no pending confirmation", async () => {
    mocks.getPendingRegistration.mockResolvedValue(
      null
    );

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      "Explicit confirmation is required"
    );
    expect(
      mocks.createOrder
    ).not.toHaveBeenCalled();
  });

  it("blocks payment for a different tournament", async () => {
    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-2",
      action: "PAYMENT_REQUIRED",
      confirmedAt:
        new Date("2026-08-22T10:01:00.000Z"),
    });

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(false);
    expect(
      mocks.createOrder
    ).not.toHaveBeenCalled();
  });

  it("blocks stale confirmation from an earlier request", async () => {
    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      confirmedAt:
        new Date("2026-08-22T09:59:00.000Z"),
    });

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(false);
    expect(
      mocks.createOrder
    ).not.toHaveBeenCalled();
  });

  it("allows payment after valid confirmation", async () => {
    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      confirmedAt:
        new Date("2026-08-22T10:01:00.000Z"),
    });

    mocks.createOrder.mockResolvedValue({
      orderId: "order-1",
      amount: 100000,
      currency: "INR",
      tournamentId: "tournament-1",
    });

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(true);
    expect(
      mocks.createOrder
    ).toHaveBeenCalledWith({
      tournamentId: "tournament-1",
      userId: "player-1",
    });
    expect(
      mocks.clearPendingRegistration
    ).toHaveBeenCalledWith(
      "conversation-1"
    );
  });

  it("blocks payment when confirmation is missing", async () => {
    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      confirmedAt: null,
    });

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(false);
    expect(
      mocks.createOrder
    ).not.toHaveBeenCalled();
  });
});

describe("AI payment completion messaging", () => {
  it("does not claim registration or payment success after creating an order", async () => {
    mocks.getPendingRegistration.mockResolvedValue({
      tournamentId: "tournament-1",
      action: "PAYMENT_REQUIRED",
      confirmedAt:
        new Date("2026-08-22T10:01:00.000Z"),
    });

    mocks.createOrder.mockResolvedValue({
      orderId: "order-1",
      amount: 100000,
      currency: "INR",
      tournamentId: "tournament-1",
    });

    const result =
      await paymentTools.createOrder(
        { tournamentId: "tournament-1" },
        {
          user: {
            id: "player-1",
            role: "PLAYER",
          },
          conversationId: "conversation-1",
          requestStartedAt:
            new Date("2026-08-22T10:00:00.000Z"),
        }
      );

    expect(result.success).toBe(true);

    expect(result.message).not.toMatch(
      /payment (was )?successful|payment completed|registered successfully|registration successful/i
    );

    expect(result.message).toMatch(
      /payment order created/i
    );

    expect(result.message).toMatch(
      /not completed yet/i
    );
  });
});
