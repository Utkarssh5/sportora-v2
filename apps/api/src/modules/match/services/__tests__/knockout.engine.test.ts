import { describe, expect, it } from "vitest";

import {
  calculateKnockoutBracket,
  createKnockoutFixturePlan,
} from "../knockout/knockout.engine.js";

import type {
  FixtureParticipant,
} from "../knockout/knockout.types.js";

function participants(
  count: number,
  type: FixtureParticipant["participantType"] = "TEAM"
): FixtureParticipant[] {
  return Array.from(
    { length: count },
    (_, index) => ({
      participantId: `participant-${index + 1}`,
      participantType: type,
      displayName: `Participant ${index + 1}`,
    })
  );
}

describe("Generic Knockout Engine", () => {
  it.each([
    [2, 2, 0, 1, 1],
    [3, 3, 1, 2, 1],
    [4, 4, 0, 2, 2],
    [5, 5, 2, 3, 2],
    [6, 6, 1, 3, 3],
    [7, 7, 1, 4, 3],
    [8, 8, 0, 4, 4],
    [16, 16, 0, 8, 8],
    [20, 20, 2, 10, 10],
    [24, 24, 1, 12, 12],
    [30, 30, 1, 15, 15],
    [32, 32, 0, 16, 16],
  ])(
    "%i participants -> correct bracket",
    (
      count,
      bracketSize,
      byeCount,
      openingMatches,
      realOpeningMatches
    ) => {
      const result =
        calculateKnockoutBracket(count);

      expect(result.participantCount).toBe(count);
      expect(result.bracketSize).toBe(
        bracketSize
      );
      expect(result.byeCount).toBe(
        byeCount
      );
      expect(result.openingMatchCount).toBe(
        openingMatches
      );
      expect(
        result.realOpeningMatchCount
      ).toBe(realOpeningMatches);
      expect(result.totalMatchCount).toBe(
        result.roundMatchCounts.reduce(
          (total, count) =>
            total + count,
          0
        )
      );
    }
  );

  it("creates exactly one final", () => {
    const plan =
      createKnockoutFixturePlan(
        participants(20)
      );

    const finals =
      plan.matches.filter(
        (match) => match.roundNumber === 5
      );

    expect(finals).toHaveLength(1);
  });

  it("does not create BYE vs BYE", () => {
    const plan =
      createKnockoutFixturePlan(
        participants(20)
      );

    const firstRound =
      plan.matches.filter(
        (match) => match.roundNumber === 1
      );

    expect(
      firstRound.some(
        (match) =>
          !match.participantA &&
          !match.participantB
      )
    ).toBe(false);
  });

  it("creates no BYEs for a power-of-two field", () => {
    const plan =
      createKnockoutFixturePlan(
        participants(32)
      );

    expect(plan.summary.byeCount).toBe(0);

    expect(
      plan.matches
        .slice(0, 16)
        .every(
          (match) => !match.isBye
        )
    ).toBe(true);
  });

  it("does not create BYEs in round 1 for 20 participants", () => {
    const plan =
      createKnockoutFixturePlan(
        participants(20)
      );

    const firstRound =
      plan.matches.filter(
        (match) => match.roundNumber === 1
      );

    expect(firstRound).toHaveLength(10);
    expect(
      firstRound.filter(
        (match) => match.isBye
      )
    ).toHaveLength(0);

    expect(
      firstRound.filter(
        (match) =>
          match.participantA &&
          match.participantB
      )
    ).toHaveLength(10);
  });

  it("does not create BYEs in round 1 for 30 participants", () => {
    const plan =
      createKnockoutFixturePlan(
        participants(30)
      );

    const firstRound =
      plan.matches.filter(
        (match) => match.roundNumber === 1
      );

    expect(firstRound).toHaveLength(15);
    expect(
      firstRound.filter(
        (match) => match.isBye
      )
    ).toHaveLength(0);

    expect(
      firstRound.filter(
        (match) =>
          match.participantA &&
          match.participantB
      )
    ).toHaveLength(15);
  });

  it("rejects duplicate participants", () => {
    const duplicateParticipants =
      participants(4);

    duplicateParticipants[1] =
      duplicateParticipants[0]!;

    expect(() =>
      createKnockoutFixturePlan(
        duplicateParticipants
      )
    ).toThrow(
      "Duplicate participants are not allowed in a knockout fixture."
    );
  });

  it("rejects fewer than 2 participants", () => {
    expect(() =>
      createKnockoutFixturePlan(
        participants(1)
      )
    ).toThrow(
      "Knockout tournaments require at least 2 participants."
    );
  });

  it("links every first-round slot to exactly one next-round slot", () => {
    const plan = createKnockoutFixturePlan(
      participants(8)
    );

    const firstRound = plan.matches.filter(
      (match) => match.roundNumber === 1
    );

    const secondRound = plan.matches.filter(
      (match) => match.roundNumber === 2
    );

    expect(firstRound).toHaveLength(4);
    expect(secondRound).toHaveLength(2);

    for (const match of firstRound) {
      expect(match.nextMatchIndex).toBeDefined();
      expect(
        match.nextMatchIndex
      ).toBeGreaterThanOrEqual(4);
      expect(
        match.nextMatchIndex
      ).toBeLessThan(6);
    }
  });

  it("links two first-round matches into the same next-round match", () => {
    const plan = createKnockoutFixturePlan(
      participants(8)
    );

    const firstRound = plan.matches.filter(
      (match) => match.roundNumber === 1
    );

    const linkedTargets = firstRound.map(
      (match) => match.nextMatchIndex
    );

    expect(
      new Set(linkedTargets).size
    ).toBe(2);

    expect(
      linkedTargets.filter(
        (index) => index === 4
      )
    ).toHaveLength(2);

    expect(
      linkedTargets.filter(
        (index) => index === 5
      )
    ).toHaveLength(2);
  });

  it("reduces 20 participants progressively to one winner", () => {
    const plan = createKnockoutFixturePlan(
      participants(20)
    );

    expect(plan.summary.roundSizes).toEqual([
      20,
      10,
      5,
      3,
      2,
    ]);

    expect(plan.summary.roundMatchCounts).toEqual([
      10,
      5,
      3,
      2,
      1,
    ]);

    expect(plan.summary.totalMatchCount).toBe(21);

    const firstRound = plan.matches.filter(
      (match) => match.roundNumber === 1
    );

    expect(
      firstRound.every(
        (match) => !match.isBye
      )
    ).toBe(true);
  });

  it("supports all competition participant types", () => {
    const types: FixtureParticipant["participantType"][] =
      [
        "SINGLES",
        "DOUBLES",
        "MIXED_DOUBLES",
        "TEAM",
        "RELAY",
      ];

    for (const type of types) {
      const plan =
        createKnockoutFixturePlan(
          participants(4, type)
        );

      expect(
        plan.participants.every(
          (participant) =>
            participant.participantType === type
        )
      ).toBe(true);
    }
  });
});
