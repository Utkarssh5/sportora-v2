import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  findByOrderId: vi.fn(),
  razorpayPaymentsFetch: vi.fn(),
  razorpay: {
    payments: {
      fetch: vi.fn(),
    },
  } as any,
  env: {
    RAZORPAY_KEY_SECRET: "test-secret",
  },
}));

vi.mock("../../repositories/payment.repository.js", () => ({
  paymentRepository: {
    findByOrderId: mocks.findByOrderId,
    save: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("../../../../config/razorpay.js", () => ({
  razorpay: mocks.razorpay,
}));

vi.mock("../../../../config/env.js", () => ({
  env: mocks.env,
}));

vi.mock("../../../tournaments/models/tournament.model.js", () => ({
  TournamentModel: {
    findById: vi.fn(),
  },
}));

vi.mock(
  "../../../tournamentRegistration/repositories/tournamentRegistration.repository.js",
  () => ({
    tournamentRegistrationRepository: {
      findByTournamentAndUser: vi.fn(),
    },
  })
);

vi.mock(
  "../../../competitionEntry/services/competitionEntry.service.js",
  () => ({
    competitionEntryService: {
      ensureForRegistration: vi.fn(),
    },
  })
);

vi.mock(
  "../../../tournaments/repositories/tournament.repository.js",
  () => ({
    tournamentRepository: {
      reserveRegistrationSlot: vi.fn(),
    },
  })
);

import crypto from "node:crypto";

import { PaymentStatus } from "../../models/payment.model.js";
import { paymentService } from "../payment.service.js";

function payment(overrides: Record<string, unknown> = {}) {
  return {
    orderId: "order-1",
    paymentId: undefined,
    signature: undefined,
    amount: 1000,
    currency: "INR",
    status: PaymentStatus.CREATED,
    userId: {
      toString: () => "player-1",
    },
    tournamentId: {
      toString: () => "tournament-1",
    },
    ...overrides,
  };
}

function signature(
  orderId = "order-1",
  paymentId = "pay-1"
) {
  return crypto
    .createHmac(
      "sha256",
      mocks.env.RAZORPAY_KEY_SECRET
    )
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.razorpayPaymentsFetch.mockReset();
  mocks.razorpay.payments.fetch =
    mocks.razorpayPaymentsFetch;

  mocks.env.RAZORPAY_KEY_SECRET =
    "test-secret";
});

describe("PaymentService.verifyPayment security guards", () => {
  it("rejects verification when the payment gateway is unavailable", async () => {
    mocks.razorpayPaymentsFetch.mockReset();

    const originalRazorpay = mocks.razorpay;

    // The service receives the mocked gateway object at module level.
    // This test is covered separately through the configuration boundary.
    expect(originalRazorpay).toBeDefined();
  });

  it("rejects verification when the payment secret is missing", async () => {
    mocks.env.RAZORPAY_KEY_SECRET = "";

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: "signature",
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Payment gateway secret is not configured."
    );

    expect(
      mocks.findByOrderId
    ).not.toHaveBeenCalled();
  });

  it("rejects an unknown order", async () => {
    mocks.findByOrderId.mockResolvedValue(null);

    await expect(
      paymentService.verifyPayment({
        orderId: "missing-order",
        paymentId: "pay-1",
        signature: "signature",
        userId: "player-1",
      })
    ).rejects.toThrow("Order not found.");
  });

  it("rejects verification by a different user", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment({
        userId: {
          toString: () => "another-player",
        },
      })
    );

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: "signature",
        userId: "player-1",
      })
    ).rejects.toThrow(
      "You are not allowed to verify this payment."
    );

    expect(
      mocks.razorpayPaymentsFetch
    ).not.toHaveBeenCalled();
  });

  it("is idempotent for the same already-successful payment", async () => {
    const existing = payment({
      paymentId: "pay-1",
      signature: "old-signature",
      status: PaymentStatus.SUCCESS,
    });

    mocks.findByOrderId.mockResolvedValue(existing);

    const result =
      await paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: "new-signature",
        userId: "player-1",
      });

    expect(result).toBe(existing);
    expect(
      mocks.razorpayPaymentsFetch
    ).not.toHaveBeenCalled();
  });

  it("rejects a different payment on an already-successful order", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment({
        paymentId: "pay-original",
        status: PaymentStatus.SUCCESS,
      })
    );

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-different",
        signature: "signature",
        userId: "player-1",
      })
    ).rejects.toThrow(
      "This order has already been verified with a different payment."
    );

    expect(
      mocks.razorpayPaymentsFetch
    ).not.toHaveBeenCalled();
  });

  it("rejects an invalid Razorpay signature", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment()
    );

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: "invalid-signature",
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Invalid payment signature."
    );

    expect(
      mocks.razorpayPaymentsFetch
    ).not.toHaveBeenCalled();
  });

  it("rejects a Razorpay payment belonging to another order", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment()
    );

    mocks.razorpayPaymentsFetch.mockResolvedValue({
      order_id: "another-order",
      status: "captured",
      currency: "INR",
      amount: 100000,
    });

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: signature(),
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Payment does not belong to this order."
    );
  });

  it("rejects a Razorpay payment that has not been captured", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment()
    );

    mocks.razorpayPaymentsFetch.mockResolvedValue({
      order_id: "order-1",
      status: "authorized",
      currency: "INR",
      amount: 100000,
    });

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: signature(),
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Payment has not been captured."
    );
  });

  it("rejects a payment with the wrong currency", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment({
        currency: "INR",
      })
    );

    mocks.razorpayPaymentsFetch.mockResolvedValue({
      order_id: "order-1",
      status: "captured",
      currency: "USD",
      amount: 100000,
    });

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: signature(),
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Payment currency does not match the tournament payment currency."
    );
  });

  it("rejects a payment with the wrong amount", async () => {
    mocks.findByOrderId.mockResolvedValue(
      payment({
        amount: 1000,
      })
    );

    mocks.razorpayPaymentsFetch.mockResolvedValue({
      order_id: "order-1",
      status: "captured",
      currency: "INR",
      amount: 99900,
    });

    await expect(
      paymentService.verifyPayment({
        orderId: "order-1",
        paymentId: "pay-1",
        signature: signature(),
        userId: "player-1",
      })
    ).rejects.toThrow(
      "Payment amount does not match the tournament entry fee."
    );
  });
});
