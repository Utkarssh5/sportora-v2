import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  getTournaments: vi.fn(),
}));

vi.mock(
  "../../../tournaments/services/tournament.service.js",
  () => ({
    tournamentService: {
      getTournaments: mocks.getTournaments,
    },
  })
);

import { tournamentTools } from "../tournament.tools.js";

function context() {
  return {
    user: {
      id: "player-1",
      role: "PLAYER",
    },
    conversationId: "conversation-1",
  };
}

describe("AI tournament discovery safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getTournaments.mockResolvedValue({
      tournaments: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  });

  it("only searches approved tournaments with an open registration deadline", async () => {
    await tournamentTools.searchTournaments(
      {
        city: "Jaipur",
        sport: "Football",
      },
      context()
    );

    expect(
      mocks.getTournaments
    ).toHaveBeenCalledTimes(1);

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter, page, limit] =
      call!;

    expect(filter.status).toBe("APPROVED");
    expect(filter.registrationDeadline).toEqual({
      $gt: expect.any(Date),
    });

    expect(filter.city).toEqual(
      expect.any(RegExp)
    );

    expect(filter.sport).toEqual(
      expect.any(RegExp)
    );

    expect(page).toBe(1);
    expect(limit).toBe(10);
  });

  it("applies tournament search text across relevant discovery fields", async () => {
    await tournamentTools.searchTournaments(
      {
        search: "SKIT",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] =
      call!;

    expect(filter.$or).toHaveLength(5);

    const fields =
      filter.$or.map(
        (condition: Record<string, unknown>) =>
          Object.keys(condition)[0]
      );

    expect(fields).toEqual([
      "title",
      "sport",
      "city",
      "state",
      "locationName",
    ]);

    for (const condition of filter.$or) {
      const value =
        Object.values(condition)[0];

      expect(value).toBeInstanceOf(RegExp);
      expect((value as RegExp).source).toBe("SKIT");
      expect((value as RegExp).flags).toContain("i");
    }
  });

  it("does not allow a caller to override approved-only discovery", async () => {
    await tournamentTools.searchTournaments(
      {
        status: "COMPLETED",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] =
      call!;

    expect(filter.status).toBe(
      "APPROVED"
    );

    expect(filter.registrationDeadline).toEqual({
      $gt: expect.any(Date),
    });
  });

  it("respects the maximum AI discovery limit", async () => {
    await tournamentTools.searchTournaments(
      {
        limit: 100,
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [, , limit] =
      call!;

    expect(limit).toBe(20);
  });
});
