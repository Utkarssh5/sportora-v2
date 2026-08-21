import type {
  FixtureParticipant,
  KnockoutBracketSummary,
  KnockoutFixturePlan,
  PlannedKnockoutMatch,
} from "./knockout.types.js";

function validateParticipants(
  participants: FixtureParticipant[]
): void {
  if (participants.length < 2) {
    throw new Error(
      "Knockout tournaments require at least 2 participants."
    );
  }

  const participantIds = participants.map(
    (participant) => participant.participantId
  );

  if (
    new Set(participantIds).size !==
    participantIds.length
  ) {
    throw new Error(
      "Duplicate participants are not allowed in a knockout fixture."
    );
  }
}

export function calculateKnockoutBracket(
  participantCount: number
): KnockoutBracketSummary {
  if (
    !Number.isInteger(participantCount) ||
    participantCount < 2
  ) {
    throw new Error(
      "Knockout tournaments require at least 2 participants."
    );
  }

  const roundSizes: number[] = [];
  const roundMatchCounts: number[] = [];

  let entrants = participantCount;
  let byeCount = 0;
  let totalMatchCount = 0;

  while (entrants > 1) {
    roundSizes.push(entrants);

    const realMatchCount =
      Math.floor(entrants / 2);

    const hasBye =
      entrants % 2 === 1;

    const matchCount =
      realMatchCount +
      (hasBye ? 1 : 0);

    roundMatchCounts.push(matchCount);

    if (hasBye) {
      byeCount++;
    }

    totalMatchCount += matchCount;

    /*
     * Every match slot produces one entrant
     * for the next round:
     *
     * 10 matches -> 10 entrants
     * 5 slots    -> 5 entrants
     */
    entrants = matchCount;
  }

  return {
    participantCount,
    bracketSize: participantCount,
    byeCount,
    openingMatchCount:
      roundMatchCounts[0]!,
    realOpeningMatchCount:
      Math.floor(participantCount / 2),
    totalMatchCount,
    roundSizes,
    roundMatchCounts,
  };
}

export function createKnockoutFixturePlan(
  participants: FixtureParticipant[]
): KnockoutFixturePlan {
  validateParticipants(participants);

  const summary =
    calculateKnockoutBracket(
      participants.length
    );

  const matches: PlannedKnockoutMatch[] = [];

  /*
   * IMPORTANT:
   *
   * All rounds are created exactly once.
   *
   * We do NOT create the next round while
   * iterating through the current round.
   *
   * Example for 20:
   *
   * R1 = 10
   * R2 = 5
   * R3 = 3
   * R4 = 2
   * R5 = 1
   *
   * Then we link R1 -> R2 -> R3 -> R4 -> R5.
   */

  const roundStarts: number[] = [];

  /*
   * 1. Create the complete structural bracket.
   */
  for (
    let roundIndex = 0;
    roundIndex < summary.roundMatchCounts.length;
    roundIndex++
  ) {
    const roundNumber =
      roundIndex + 1;

    const matchCount =
      summary.roundMatchCounts[roundIndex]!;

    roundStarts.push(matches.length);

    for (
      let matchIndex = 0;
      matchIndex < matchCount;
      matchIndex++
    ) {
      const isBye =
        summary.roundSizes[roundIndex]! % 2 === 1 &&
        matchIndex === matchCount - 1;

      matches.push({
        roundNumber,
        matchNumber:
          matchIndex + 1,
        isBye,
      });
    }
  }

  /*
   * 2. Put actual participants into round 1.
   */
  const firstRoundStart =
    roundStarts[0]!;

  const firstRoundCount =
    summary.roundMatchCounts[0]!;

  const firstRoundRealMatches =
    Math.floor(participants.length / 2);

  for (
    let index = 0;
    index < firstRoundRealMatches;
    index++
  ) {
    const match =
      matches[
        firstRoundStart + index
      ];

    const participantA =
      participants[index * 2];

    const participantB =
      participants[index * 2 + 1];

    if (!match || !participantA || !participantB) {
      throw new Error(
        "Invalid knockout bracket: first-round pairing failed."
      );
    }

    match.participantA =
      participantA;

    match.participantB =
      participantB;

    match.isBye = false;
  }

  /*
   * 3. If round 1 is odd, assign its BYE participant.
   */
  if (
    participants.length % 2 === 1
  ) {
    const byeMatch =
      matches[
        firstRoundStart +
          firstRoundCount -
          1
      ];

    const byeParticipant =
      participants[
        participants.length - 1
      ];

    if (!byeMatch || !byeParticipant) {
      throw new Error(
        "Invalid knockout bracket: first-round BYE could not be created."
      );
    }

    byeMatch.participantA =
      byeParticipant;

    byeMatch.isBye = true;
  }

  /*
   * 4. Link every round to the next round.
   *
   * For each pair:
   *
   * current match 0 -> next match 0
   * current match 1 -> next match 0
   * current match 2 -> next match 1
   * current match 3 -> next match 1
   *
   * If there is an odd final slot, it maps
   * directly to the final slot of the next round.
   */
  for (
    let roundIndex = 0;
    roundIndex <
      roundStarts.length - 1;
    roundIndex++
  ) {
    const currentStart =
      roundStarts[roundIndex]!;

    const currentCount =
      summary.roundMatchCounts[
        roundIndex
      ]!;

    const nextStart =
      roundStarts[roundIndex + 1]!;

    const nextCount =
      summary.roundMatchCounts[
        roundIndex + 1
      ]!;

    for (
      let index = 0;
      index < currentCount;
      index++
    ) {
      const currentMatch =
        matches[currentStart + index];

      const targetOffset =
        Math.floor(index / 2);

      if (
        targetOffset >= nextCount
      ) {
        throw new Error(
          "Invalid knockout bracket: next-round target is out of range."
        );
      }

      if (!currentMatch) {
        throw new Error(
          "Invalid knockout bracket: current match is missing."
        );
      }

      currentMatch.nextMatchIndex =
        nextStart + targetOffset;
    }
  }

  return {
    participants,
    summary,
    matches,
  };
}
