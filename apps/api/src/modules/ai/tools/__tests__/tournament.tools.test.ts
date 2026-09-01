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

  it("searches tournaments without forcing approval status", async () => {
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

    expect(filter.status).toBeUndefined();
    expect(filter.registrationDeadline).toBeUndefined();

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

  it("allows explicit tournament status filtering", async () => {
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

    expect(filter.status).toBeUndefined();

    expect(filter.endDate).toEqual({
      $lt: expect.any(Date),
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

  it("applies an explicit tournament start-date range", async () => {
    await tournamentTools.searchTournaments(
      {
        startDateFrom: "2026-08-25T00:00:00.000Z",
        startDateTo: "2026-08-30T23:59:59.999Z",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] = call!;

    expect(filter.startDate).toEqual({
      $gte: new Date("2026-08-25T00:00:00.000Z"),
      $lte: new Date("2026-08-30T23:59:59.999Z"),
    });
  });

  it("combines date range with city and sport filters", async () => {
    await tournamentTools.searchTournaments(
      {
        city: "Jaipur",
        sport: "Football",
        startDateFrom: "2026-08-25T00:00:00.000Z",
        startDateTo: "2026-08-30T23:59:59.999Z",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] = call!;

    expect(filter.city).toEqual(expect.any(RegExp));
    expect(filter.sport).toEqual(expect.any(RegExp));

    expect(filter.startDate).toEqual({
      $gte: new Date("2026-08-25T00:00:00.000Z"),
      $lte: new Date("2026-08-30T23:59:59.999Z"),
    });
  });

  it("supports only a lower date boundary", async () => {
    await tournamentTools.searchTournaments(
      {
        startDateFrom: "2026-09-01T00:00:00.000Z",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] = call!;

    expect(filter.startDate).toEqual({
      $gte: new Date("2026-09-01T00:00:00.000Z"),
    });
  });

  it("supports only an upper date boundary", async () => {
    await tournamentTools.searchTournaments(
      {
        startDateTo: "2026-09-30T23:59:59.999Z",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] = call!;

    expect(filter.startDate).toEqual({
      $lte: new Date("2026-09-30T23:59:59.999Z"),
    });
  });

  it("ignores an invalid date boundary instead of creating an invalid Mongo date", async () => {
    await tournamentTools.searchTournaments(
      {
        startDateFrom: "not-a-date",
        startDateTo: "also-not-a-date",
      },
      context()
    );

    const call =
      mocks.getTournaments.mock.calls[0];

    expect(call).toBeDefined();

    const [filter] = call!;

    expect(filter.startDate).toBeUndefined();
  });

});
