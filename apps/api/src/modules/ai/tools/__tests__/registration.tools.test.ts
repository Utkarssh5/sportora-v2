import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getTournamentById: vi.fn(),
  register: vi.fn(),
  setPendingRegistration: vi.fn(),
  clearPendingRegistration: vi.fn(),
}));

vi.mock("../../../tournaments/services/tournament.service.js", () => ({
  tournamentService: {
    getTournamentById: mocks.getTournamentById,
  },
}));

vi.mock(
  "../../../tournamentRegistration/services/tournamentRegistration.service.js",
  () => ({
    tournamentRegistrationService: {
      register: mocks.register,
    },
  })
);

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    setPendingRegistration:
      mocks.setPendingRegistration,
    clearPendingRegistration:
      mocks.clearPendingRegistration,
  },
}));

import { registrationTools } from "../registration.tools.js";

function context() {
  return {
    user: {
      id: "player-1",
      role: "PLAYER",
    },
    conversationId: "conversation-1",
  };
}

describe("AI tournament registration safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not directly register a paid tournament", async () => {
    mocks.getTournamentById.mockResolvedValue({
      _id: "tournament-1",
      entryFee: 1000,
    });

    const result =
      await registrationTools.register(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      tournamentId: "tournament-1",
      entryFee: 1000,
      paymentRequired: true,
      confirmationRequired: true,
    });

    expect(
      mocks.setPendingRegistration
    ).toHaveBeenCalledWith(
      "conversation-1",
      "tournament-1",
      "PAYMENT_REQUIRED"
    );

    expect(
      mocks.register
    ).not.toHaveBeenCalled();
  });

  it("creates a real registration for a free tournament", async () => {
    const registration = {
      id: "registration-1",
      tournamentId: "tournament-1",
      userId: "player-1",
      status: "REGISTERED",
    };

    mocks.getTournamentById.mockResolvedValue({
      _id: "tournament-1",
      entryFee: 0,
    });

    mocks.register.mockResolvedValue(
      registration
    );

    const result =
      await registrationTools.register(
        { tournamentId: "tournament-1" },
        context()
      );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      registration
    );

    expect(
      mocks.register
    ).toHaveBeenCalledWith(
      "tournament-1",
      "player-1"
    );

    expect(
      mocks.clearPendingRegistration
    ).toHaveBeenCalledWith(
      "conversation-1"
    );

    expect(
      mocks.setPendingRegistration
    ).not.toHaveBeenCalled();
  });

  it("rejects non-player registration requests", async () => {
    const organizerContext = {
      user: {
        id: "organizer-1",
        role: "ORGANIZER",
      },
      conversationId: "conversation-1",
    };

    const result =
      await registrationTools.register(
        { tournamentId: "tournament-1" },
        organizerContext
      );

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      "Only players can register"
    );

    expect(
      mocks.getTournamentById
    ).not.toHaveBeenCalled();

    expect(
      mocks.register
    ).not.toHaveBeenCalled();
  });

  it("rejects a missing tournament", async () => {
    mocks.getTournamentById.mockResolvedValue(
      null
    );

    const result =
      await registrationTools.register(
        { tournamentId: "missing-tournament" },
        context()
      );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Tournament not found."
    );

    expect(
      mocks.register
    ).not.toHaveBeenCalled();

    expect(
      mocks.setPendingRegistration
    ).not.toHaveBeenCalled();
  });
});
