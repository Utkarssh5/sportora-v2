export interface TournamentDiscoveryIntent {
  search?: string;
  sport?: string;
  city?: string;
  nearMe?: boolean;
}

const SPORTS = [
  'Football',
  'Cricket',
  'Badminton',
  'Basketball',
  'Volleyball',
  'Table Tennis',
] as const;

const SPORT_ALIASES: Record<string, string> = {
  football: 'Football',
  soccer: 'Football',
  cricket: 'Cricket',
  badminton: 'Badminton',
  basketball: 'Basketball',
  volleyball: 'Volleyball',
  'table tennis': 'Table Tennis',
  'table-tennis': 'Table Tennis',
  tt: 'Table Tennis',
};

const LOCATION_PATTERNS = [
  /\b(?:in|at|near|around)\s+(.+)$/i,
  /\b(?:tournaments?|matches?|events?)\s+(?:in|at|near|around)\s+(.+)$/i,
];

export function parseTournamentDiscoveryQuery(
  input: string,
): TournamentDiscoveryIntent {
  const raw = input.trim();

  if (!raw) {
    return {};
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, ' ').trim();

  const intent: TournamentDiscoveryIntent = {};

  if (
    /\bnear\s+me\b/i.test(normalized) ||
    /\bnearby\b/i.test(normalized)
  ) {
    intent.nearMe = true;
  }

  for (const [alias, sport] of Object.entries(SPORT_ALIASES)) {
    if (
      new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i').test(
        normalized,
      )
    ) {
      intent.sport = sport;
      break;
    }
  }

  let locationCandidate = '';

  for (const pattern of LOCATION_PATTERNS) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      locationCandidate = match[1]
        .replace(/\bnear\s+me\b/i, '')
        .replace(/\bnearby\b/i, '')
        .trim();

      break;
    }
  }

  if (
    locationCandidate &&
    !/\bme\b/i.test(locationCandidate) &&
    !SPORT_ALIASES[locationCandidate]
  ) {
    intent.city =
      locationCandidate
        .replace(/\b(?:tournaments?|matches?|events?)\b/gi, '')
        .trim()
        .replace(/\s+/g, ' ');
  }

  if (!intent.sport && !intent.city && !intent.nearMe) {
    intent.search = raw;
  }

  return intent;
}

export function buildTournamentDiscoveryUrl(
  input: string,
): string {
  const intent = parseTournamentDiscoveryQuery(input);
  const params = new URLSearchParams();

  if (intent.search) {
    params.set('search', intent.search);
  }

  if (intent.sport) {
    params.set('sport', intent.sport);
  }

  if (intent.city) {
    params.set('city', intent.city);
  }

  if (intent.nearMe) {
    params.set('nearMe', 'true');
  }

  const query = params.toString();

  return query ? `/tournaments?${query}` : '/tournaments';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
