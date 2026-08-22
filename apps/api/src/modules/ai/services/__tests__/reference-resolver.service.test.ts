import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/ai.repository.js", () => ({
  aiRepository: {
    getAgentState: vi.fn(),
  },
}));

import { aiRepository } from "../../repositories/ai.repository.js";
import { referenceResolverService } from "../reference-resolver.service.js";

import type { AgentContext } from "../../types.js";

const getAgentState =
  vi.mocked(aiRepository.getAgentState);

const context: AgentContext = {
  user: {
    id: "player-1",
    role: "PLAYER",
  },
  conversationId: "conversation-1",
};

const candidates = [
  {
    id: "tournament-1",
    title: "Jaipur Open Football Championship",
    sport: "Football",
    city: "Jaipur",
    entryFee: 1000,
  },
  {
    id: "tournament-2",
    title: "Jaipur Football Cup",
    sport: "Football",
    city: "Jaipur",
    entryFee: 500,
  },
  {
    id: "tournament-3",
    title: "Jaipur Cricket League",
    sport: "Cricket",
    city: "Jaipur",
    entryFee: 800,
  },
];

describe("ReferenceResolverService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_DISCOVERY",
      candidateTournaments: candidates,
      updatedAt: new Date(),
    } as any);
  });

  it("resolves 'pehla wala' to the first tournament", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "pehla wala",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-1",
      reason: "ORDINAL",
    });
  });

  it("resolves 'second' to the second tournament", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "second",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-2",
      reason: "ORDINAL",
    });
  });

  it("resolves 'teesra' to the third tournament", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "teesra",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-3",
      reason: "ORDINAL",
    });
  });

  it.each([
    ["first one", "tournament-1"],
    ["the first one", "tournament-1"],
    ["first tournament", "tournament-1"],
    ["number one", "tournament-1"],
    ["number 1", "tournament-1"],
    ["no. 1", "tournament-1"],
    ["#1", "tournament-1"],
    ["pehle wale", "tournament-1"],
    ["pehla tournament", "tournament-1"],
    ["दूसरा", "tournament-2"],
    ["doosre wale", "tournament-2"],
    ["the second one", "tournament-2"],
    ["number two", "tournament-2"],
    ["#2", "tournament-2"],
    ["तीसरा", "tournament-3"],
    ["teesre wale", "tournament-3"],
    ["the third one", "tournament-3"],
    ["number three", "tournament-3"],
    ["#3", "tournament-3"],
  ])("resolves natural ordinal phrase '%s'", async (reference, expectedId) => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        reference,
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: expectedId,
      reason: "ORDINAL",
    });
  });

  it.each([
    ["the tournament you mentioned first", "tournament-1"],
    ["the one you mentioned first", "tournament-1"],
    ["the first tournament you showed me", "tournament-1"],
    ["jo sabse pehle bataya tha", "tournament-1"],
    ["jo pehle bataya tha", "tournament-1"],
    ["jo tumne starting mein bataya tha", "tournament-1"],
    ["the tournament you mentioned second", "tournament-2"],
    ["the one you showed second", "tournament-2"],
    ["jo dusre number par bataya tha", "tournament-2"],
    ["jo doosra bataya tha", "tournament-2"],
    ["the tournament you mentioned third", "tournament-3"],
    ["the one you showed third", "tournament-3"],
    ["jo teesre number par bataya tha", "tournament-3"],
  ])("resolves sentence reference '%s'", async (reference, expectedId) => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        reference,
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: expectedId,
      reason: "ORDINAL",
    });
  });

  it("resolves 'isme' using the active tournament", async () => {
    getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_DETAILS",
      activeEntity: {
        type: "TOURNAMENT",
        id: "tournament-active",
        label: "Jaipur Open Football Championship",
      },
      candidateTournaments: [],
      updatedAt: new Date(),
    } as any);

    const result =
      await referenceResolverService.resolveTournamentReference(
        "isme",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-active",
      reason: "ACTIVE_ENTITY",
    });
  });

  it("resolves 'wahi tournament' using the active tournament", async () => {
    getAgentState.mockResolvedValue({
      activeIntent: "TOURNAMENT_DETAILS",
      activeEntity: {
        type: "TOURNAMENT",
        id: "tournament-active",
      },
      candidateTournaments: [],
      updatedAt: new Date(),
    } as any);

    const result =
      await referenceResolverService.resolveTournamentReference(
        "wahi tournament",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-active",
      reason: "ACTIVE_ENTITY",
    });
  });

  it("resolves a unique tournament title fragment", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "football championship",
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: "tournament-1",
      reason: "TITLE_MATCH",
    });
  });

  it.each([
    ["Jaipur Open Football Championship", "tournament-1"],
    ["football championship", "tournament-1"],
    ["Jaipur Football Cup", "tournament-2"],
  ])("continues resolving exact/partial title reference '%s'", async (reference, expectedId) => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        reference,
        context
      );

    expect(result).toEqual({
      resolved: true,
      value: expectedId,
      reason: "TITLE_MATCH",
    });
  });

  it.each([
    ["₹1000 wala", "tournament-1"],
    ["1000 wala", "tournament-1"],
    ["jiska entry fee 1000 hai", "tournament-1"],
    ["Jaipur wala cricket tournament", "tournament-3"],
    ["the cricket tournament in Jaipur", "tournament-3"],
  ])(
    "resolves unique attribute reference '%s'",
    async (reference, expectedId) => {
      const result =
        await referenceResolverService.resolveTournamentReference(
          reference,
          context
        );

      expect(result).toEqual({
        resolved: true,
        value: expectedId,
        reason: "ATTRIBUTE_MATCH",
      });
    }
  );

  it.each([
    "Jaipur wala",
    "football wala",
    "the football tournament",
    "the one in Jaipur",
    "Jaipur wala football tournament",
  ])(
    "does not guess when attribute reference '%s' is ambiguous",
    async (reference) => {
      const result =
        await referenceResolverService.resolveTournamentReference(
          reference,
          context
        );

      expect(result).toEqual({
        resolved: false,
        reason: "AMBIGUOUS",
      });
    }
  );

  it("does not guess when a title reference is ambiguous", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "Jaipur",
        context
      );

    expect(result).toEqual({
      resolved: false,
      reason: "AMBIGUOUS",
    });
  });

  it("returns NO_MATCH when the reference cannot be resolved", async () => {
    const result =
      await referenceResolverService.resolveTournamentReference(
        "Delhi tournament",
        context
      );

    expect(result).toEqual({
      resolved: false,
      reason: "NO_MATCH",
    });
  });
});
