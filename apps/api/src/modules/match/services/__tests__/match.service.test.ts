import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  update: vi.fn(),
  findTournamentById: vi.fn(),
  updateTournament: vi.fn(),
}));

vi.mock("../../repositories/match.repository.js", () => ({
  matchRepository: {
    findById: mocks.findById,
    update: mocks.update,
  },
}));

vi.mock("../../../tournaments/repositories/tournament.repository.js", () => ({
  tournamentRepository: {
    findById: mocks.findTournamentById,
    update: mocks.updateTournament,
  },
}));

import { MatchService } from "../match.service.js";
import {
  MatchRound,
  MatchStatus,
} from "../../models/match.model.js";

describe("MatchService knockout progression", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.update.mockImplementation(
      async (match) => match
    );
  });

  it("advances a normal winner into the next match", async () => {
    const currentMatch = {
      _id: "match-1",
      tournamentId: "tournament-1",
      round: MatchRound.ROUND_1,
      teamA: "player-1",
      teamB: "player-2",
      status: MatchStatus.SCHEDULED,
      winner: undefined,
      nextMatchId: "match-2",
    };

    const nextMatch = {
      _id: "match-2",
      tournamentId: "tournament-1",
      round: MatchRound.ROUND_2,
      teamA: "TBD",
      teamB: "TBD",
      status: MatchStatus.SCHEDULED,
    };

    mocks.findById
      .mockResolvedValueOnce(currentMatch)
      .mockResolvedValueOnce(nextMatch);

    const service = new MatchService();

    await service.updateScore("match-1", {
      status: MatchStatus.COMPLETED,
      winner: "player-1",
    });

    expect(nextMatch.teamA).toBe("player-1");
    expect(nextMatch.teamB).toBe("TBD");
    expect(mocks.update).toHaveBeenCalledWith(
      nextMatch
    );
  });

  it("automatically advances a winner through a structural BYE", async () => {
    const currentMatch = {
      _id: "match-1",
      tournamentId: "tournament-1",
      round: MatchRound.ROUND_2,
      teamA: "player-1",
      teamB: "player-2",
      status: MatchStatus.SCHEDULED,
      winner: undefined,
      nextMatchId: "bye-match",
    };

    const structuralBye = {
      _id: "bye-match",
      tournamentId: "tournament-1",
      round: MatchRound.ROUND_2,
      teamA: "TBD",
      teamB: "BYE",
      status: MatchStatus.CANCELLED,
      winner: undefined,
      nextMatchId: "next-match",
    };

    const nextMatch = {
      _id: "next-match",
      tournamentId: "tournament-1",
      round: MatchRound.SEMI_FINAL,
      teamA: "TBD",
      teamB: "TBD",
      status: MatchStatus.SCHEDULED,
    };

    mocks.findById
      .mockResolvedValueOnce(currentMatch)
      .mockResolvedValueOnce(structuralBye)
      .mockResolvedValueOnce(nextMatch);

    const service = new MatchService();

    await service.updateScore("match-1", {
      status: MatchStatus.COMPLETED,
      winner: "player-1",
    });

    expect(structuralBye.teamA).toBe("player-1");
    expect(structuralBye.teamB).toBe("BYE");
    expect(structuralBye.winner).toBe("player-1");
    expect(structuralBye.status).toBe(
      MatchStatus.CANCELLED
    );

    expect(nextMatch.teamA).toBe("player-1");
    expect(nextMatch.teamB).toBe("TBD");
  });

  it("does not allow a BYE match to be completed manually", async () => {
    const byeMatch = {
      _id: "bye-match",
      tournamentId: "tournament-1",
      round: MatchRound.ROUND_2,
      teamA: "player-1",
      teamB: "BYE",
      status: MatchStatus.SCHEDULED,
      winner: undefined,
      nextMatchId: "next-match",
    };

    mocks.findById.mockResolvedValueOnce(byeMatch);

    const service = new MatchService();

    await expect(
      service.updateScore("bye-match", {
        status: MatchStatus.COMPLETED,
        winner: "player-1",
      })
    ).rejects.toThrow(
      "BYE matches are completed automatically and cannot be scored manually."
    );
  });
});
