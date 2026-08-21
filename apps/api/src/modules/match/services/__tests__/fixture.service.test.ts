import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  tournamentFindById: vi.fn(),
  competitionEntryFindApprovedByTournament: vi.fn(),
  matchFindByTournament: vi.fn(),
  matchCreate: vi.fn(),
  matchUpdate: vi.fn(),
}));

vi.mock("../../../tournaments/repositories/tournament.repository.js", () => ({
  tournamentRepository: {
    findById: mocks.tournamentFindById,
  },
}));

vi.mock(
  "../../../competitionEntry/repositories/competitionEntry.repository.js",
  () => ({
    competitionEntryRepository: {
      findApprovedByTournament:
        mocks.competitionEntryFindApprovedByTournament,
    },
  })
);

vi.mock("../../repositories/match.repository.js", () => ({
  matchRepository: {
    findByTournament: mocks.matchFindByTournament,
    create: mocks.matchCreate,
    update: mocks.matchUpdate,
  },
}));

vi.mock("mongoose", async () => {
  const actual =
    await vi.importActual<typeof import("mongoose")>(
      "mongoose"
    );

  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: vi.fn(),
    },
  };
});

import mongoose from "mongoose";
import { fixtureService } from "../fixture.service.js";
import { MatchStatus } from "../../models/match.model.js";

function approvedEntries(
  count: number,
  competitionType = "SINGLES"
) {
  return Array.from(
    { length: count },
    (_, index) => ({
      _id: {
        toString: () =>
          `entry-${index + 1}`,
      },
      competitionType,
      displayName:
        competitionType === "TEAM"
          ? `Team ${index + 1}`
          : `Player ${index + 1}`,
    })
  );
}

function createSessionMock() {
  const session = {
    withTransaction: vi.fn(
      async (callback: () => Promise<void>) =>
        callback()
    ),
    endSession: vi.fn(
      async () => undefined
    ),
  };

  return session;
}

describe("FixtureService knockout persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.matchFindByTournament.mockResolvedValue(
      []
    );

    mocks.matchUpdate.mockImplementation(
      async (match) => match
    );

    mocks.matchCreate.mockImplementation(
      async (data) => ({
        ...data,
        _id: `match-${mocks.matchCreate.mock.calls.length}`,
        status: MatchStatus.SCHEDULED,
      })
    );
  });

  it("persists a 20-player progressive knockout bracket", async () => {
    mocks.tournamentFindById.mockResolvedValue({
      _id: "tournament-1",
      status: "APPROVED",
      type: "SOLO",
      format: "KNOCKOUT",
      registrationDeadline: new Date(
        Date.now() - 60_000
      ),
    });

    mocks.competitionEntryFindApprovedByTournament.mockResolvedValue(
      approvedEntries(20)
    );

    const session = createSessionMock();

    vi.mocked(mongoose.startSession).mockResolvedValue(
      session as never
    );

    const result =
      await fixtureService.generateSingleElimination(
        "tournament-1"
      );

    expect(result.totalPlayers).toBe(20);
    expect(result.totalMatches).toBe(21);

    expect(
      mocks.matchCreate
    ).toHaveBeenCalledTimes(21);

    expect(
      mocks.matchUpdate
    ).toHaveBeenCalled();

    const createdMatches =
      mocks.matchCreate.mock.calls.map(
        ([data]) => data
      );

    expect(
      createdMatches.filter(
        (match) =>
          match.teamB === "BYE"
      )
    ).toHaveLength(2);

    expect(
      createdMatches.filter(
        (match) =>
          match.teamA === "TBD" &&
          match.teamB === "BYE"
      )
    ).toHaveLength(2);
  });

  it("generates knockout fixtures from approved TEAM competition entries", async () => {
    mocks.tournamentFindById.mockResolvedValue({
      _id: "tournament-team-1",
      status: "APPROVED",
      type: "TEAM",
      competitionType: "TEAM",
      format: "KNOCKOUT",
      registrationDeadline: new Date(
        Date.now() - 60_000
      ),
    });

    const entries = approvedEntries(
      4,
      "TEAM"
    );

    mocks.competitionEntryFindApprovedByTournament.mockResolvedValue(
      entries
    );

    const session = createSessionMock();

    vi.mocked(mongoose.startSession).mockResolvedValue(
      session as never
    );

    const result =
      await fixtureService.generateSingleElimination(
        "tournament-team-1"
      );

    expect(result.totalPlayers).toBe(4);
    expect(result.totalMatches).toBe(3);

    expect(
      mocks.matchCreate
    ).toHaveBeenCalledTimes(3);

    const createdMatches =
      mocks.matchCreate.mock.calls.map(
        ([data]) => data
      );

    expect(
      createdMatches[0].teamA
    ).toBe("entry-1");

    expect(
      createdMatches[0].teamB
    ).toBe("entry-2");

    expect(
      createdMatches[1].teamA
    ).toBe("entry-3");

    expect(
      createdMatches[1].teamB
    ).toBe("entry-4");

    expect(
      mocks.competitionEntryFindApprovedByTournament
    ).toHaveBeenCalledWith(
      "tournament-team-1"
    );
  });

  it("creates no BYEs for a 16-player knockout bracket", async () => {
    mocks.tournamentFindById.mockResolvedValue({
      _id: "tournament-1",
      status: "APPROVED",
      type: "SOLO",
      format: "KNOCKOUT",
      registrationDeadline: new Date(
        Date.now() - 60_000
      ),
    });

    mocks.competitionEntryFindApprovedByTournament.mockResolvedValue(
      approvedEntries(16)
    );

    const session = createSessionMock();

    vi.mocked(mongoose.startSession).mockResolvedValue(
      session as never
    );

    const result =
      await fixtureService.generateSingleElimination(
        "tournament-1"
      );

    expect(result.totalPlayers).toBe(16);
    expect(result.totalMatches).toBe(15);

    const createdMatches =
      mocks.matchCreate.mock.calls.map(
        ([data]) => data
      );

    expect(
      createdMatches.some(
        (match) =>
          match.teamA === "BYE" ||
          match.teamB === "BYE"
      )
    ).toBe(false);
  });

  it("rejects fixture generation when fixtures already exist", async () => {
    mocks.tournamentFindById.mockResolvedValue({
      _id: "tournament-1",
      status: "APPROVED",
      type: "SOLO",
      format: "KNOCKOUT",
      registrationDeadline: new Date(
        Date.now() - 60_000
      ),
    });

    mocks.competitionEntryFindApprovedByTournament.mockResolvedValue(
      approvedEntries(4)
    );

    mocks.matchFindByTournament.mockResolvedValue([
      {
        _id: "existing-match",
      },
    ]);

    await expect(
      fixtureService.generateSingleElimination(
        "tournament-1"
      )
    ).rejects.toThrow(
      "Fixtures have already been generated for this tournament."
    );

    expect(
      mocks.matchCreate
    ).not.toHaveBeenCalled();
  });
});
