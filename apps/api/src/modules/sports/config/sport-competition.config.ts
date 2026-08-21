export type CompetitionType =
  | "SINGLES"
  | "DOUBLES"
  | "MIXED_DOUBLES"
  | "TEAM"
  | "RELAY";

export type TournamentFormat =
  | "KNOCKOUT"
  | "ROUND_ROBIN"
  | "GROUP_STAGE_KNOCKOUT";

export interface CompetitionRule {
  type: CompetitionType;
  participantCount: number;
  requiresRoster: boolean;
  supportedFormats: TournamentFormat[];
  defaultPlayingSize?: number;
  allowsSubstitutes?: boolean;
  requiresMixedGender?: boolean;
}

export interface SportCompetitionConfig {
  sport: string;
  competitions: CompetitionRule[];
}

export const SPORT_COMPETITION_CONFIG: SportCompetitionConfig[] = [
  {
    sport: "Football",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 11,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Cricket",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 11,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Basketball",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 5,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Volleyball",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 6,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Hockey",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 11,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Badminton",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "DOUBLES",
        participantCount: 2,
        requiresRoster: true,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "MIXED_DOUBLES",
        participantCount: 2,
        requiresRoster: true,
        requiresMixedGender: true,
      },
    ],
  },
  {
    sport: "Table Tennis",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "DOUBLES",
        participantCount: 2,
        requiresRoster: true,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "MIXED_DOUBLES",
        participantCount: 2,
        requiresRoster: true,
        requiresMixedGender: true,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Tennis",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "DOUBLES",
        participantCount: 2,
        requiresRoster: true,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "MIXED_DOUBLES",
        participantCount: 2,
        requiresRoster: true,
        requiresMixedGender: true,
      },
    ],
  },
  {
    sport: "Kabaddi",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 7,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Kho-Kho",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "TEAM",
        participantCount: 1,
        requiresRoster: true,
        defaultPlayingSize: 9,
        allowsSubstitutes: true,
      },
    ],
  },
  {
    sport: "Pickleball",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "DOUBLES",
        participantCount: 2,
        requiresRoster: true,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "MIXED_DOUBLES",
        participantCount: 2,
        requiresRoster: true,
        requiresMixedGender: true,
      },
    ],
  },
  {
    sport: "Squash",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "DOUBLES",
        participantCount: 2,
        requiresRoster: true,
      },
    ],
  },
  {
    sport: "Chess",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
    ],
  },
  {
    sport: "Boxing",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
    ],
  },
  {
    sport: "Wrestling",
    competitions: [
      {
        supportedFormats: [
          "KNOCKOUT",
          "ROUND_ROBIN",
          "GROUP_STAGE_KNOCKOUT",
        ],
        type: "SINGLES",
        participantCount: 1,
        requiresRoster: false,
      },
    ],
  },
];

export function getSportCompetitionConfig(sport: string) {
  return SPORT_COMPETITION_CONFIG.find(
    (item) => item.sport.toLowerCase() === sport.trim().toLowerCase(),
  );
}

export function getAllowedCompetitionTypes(sport: string): CompetitionRule[] {
  return getSportCompetitionConfig(sport)?.competitions ?? [];
}

export function getAllowedFormats(
  sport: string,
  competitionType: string,
): TournamentFormat[] {
  const rule = getAllowedCompetitionTypes(sport).find(
    (item) => item.type === competitionType,
  );

  return rule?.supportedFormats ?? [];
}

export function isFormatAllowed(
  sport: string,
  competitionType: string,
  format: string,
): boolean {
  return getAllowedFormats(sport, competitionType).includes(
    format.trim().toUpperCase() as TournamentFormat,
  );
}

export function isCompetitionAllowed(
  sport: string,
  competitionType: string,
): boolean {
  return getAllowedCompetitionTypes(sport).some(
    (rule) => rule.type === competitionType,
  );
}
