export type FixtureParticipantType =
  | "SINGLES"
  | "DOUBLES"
  | "MIXED_DOUBLES"
  | "TEAM"
  | "RELAY";

export interface FixtureParticipant {
  participantId: string;
  participantType: FixtureParticipantType;
  displayName: string;
  seed?: number;
}

export interface KnockoutBracketSummary {
  participantCount: number;

  /**
   * In progressive knockout this is the actual
   * participant count, not a power-of-two size.
   */
  bracketSize: number;

  /** Total BYE advances across all rounds. */
  byeCount: number;

  /** Number of generated slots in round 1. */
  openingMatchCount: number;

  /** Actual participant-vs-participant matches in round 1. */
  realOpeningMatchCount: number;

  /** Total generated slots including BYE slots. */
  totalMatchCount: number;

  /** Entrants at the start of every round. */
  roundSizes: number[];

  /** Generated slots in every round. */
  roundMatchCounts: number[];
}

export interface PlannedKnockoutMatch {
  roundNumber: number;
  matchNumber: number;

  /**
   * Only known for the opening round.
   * Later rounds receive their participants
   * when previous matches are completed.
   */
  participantA?: FixtureParticipant;
  participantB?: FixtureParticipant;

  /**
   * True means this slot is a BYE advancement.
   *
   * For the opening round, participantA contains
   * the participant receiving the BYE.
   *
   * For later rounds, the participant is the
   * winner of the linked previous match.
   */
  isBye: boolean;

  /** Index of the next match receiving this winner. */
  nextMatchIndex?: number;
}

export interface KnockoutFixturePlan {
  participants: FixtureParticipant[];
  summary: KnockoutBracketSummary;
  matches: PlannedKnockoutMatch[];
}
