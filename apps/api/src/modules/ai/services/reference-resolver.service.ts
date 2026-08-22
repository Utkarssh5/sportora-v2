import { aiRepository } from "../repositories/ai.repository.js";

import type {
  AgentCandidateTournament,
  AgentContext,
} from "../types.js";

export interface ReferenceResolution {
  resolved: boolean;
  value?: string;
  reason?:
    | "ORDINAL"
    | "ACTIVE_ENTITY"
    | "TITLE_MATCH"
    | "ATTRIBUTE_MATCH"
    | "NO_MATCH"
    | "AMBIGUOUS";
}

export class ReferenceResolverService {

  public static async resolveTournamentReference(
    reference: string,
    context: AgentContext
  ): Promise<ReferenceResolution> {
    if (!context.conversationId) {
      return {
        resolved: false,
        reason: "NO_MATCH",
      };
    }

    const state =
      await aiRepository.getAgentState(
        context.conversationId
      );

    const normalized =
      reference.trim().toLowerCase();

    /*
     * 1. Ordinal references:
     *
     * pehla wala
     * first
     * 1st
     * dusra
     * second
     * etc.
     */
    const ordinalIndex =
      this.getOrdinalIndex(normalized);

    if (ordinalIndex !== null) {
      const candidate =
        state?.candidateTournaments?.[ordinalIndex];

      if (!candidate) {
        return {
          resolved: false,
          reason: "NO_MATCH",
        };
      }

      return {
        resolved: true,
        value: candidate.id,
        reason: "ORDINAL",
      };
    }

    /*
     * 2. Conversational references:
     *
     * isme
     * is tournament mein
     * isi tournament
     * wahi tournament
     */
    if (this.isCurrentTournamentReference(normalized)) {
      const activeEntity =
        state?.activeEntity;

      if (
        activeEntity?.type === "TOURNAMENT" &&
        activeEntity.id
      ) {
        return {
          resolved: true,
          value: activeEntity.id,
          reason: "ACTIVE_ENTITY",
        };
      }

      return {
        resolved: false,
        reason: "NO_MATCH",
      };
    }

    /*
     * 3. Normalize candidate tournaments for
     * attribute and title resolution.
     */
    const candidates =
      this.normalizeCandidates(
        state?.candidateTournaments
      );

    /*
     * 4. Attribute-based reference.
     *
     * Examples:
     * - Jaipur wala
     * - football wala
     * - ₹1000 wala
     * - jiska entry fee 1000 hai
     * - Jaipur wala football tournament
     *
     * Multiple attributes are treated as an intersection.
     * Never guess when multiple candidates remain.
     */
    const attributeMatches =
      this.findAttributeMatches(
        normalized,
        candidates
      );

    if (attributeMatches.length === 1) {
      const match = attributeMatches[0];

      if (!match) {
        return {
          resolved: false,
          reason: "NO_MATCH",
        };
      }

      return {
        resolved: true,
        value: match.id,
        reason: "ATTRIBUTE_MATCH",
      };
    }

    if (attributeMatches.length > 1) {
      return {
        resolved: false,
        reason: "AMBIGUOUS",
      };
    }

    /*
     * 5. Exact / partial title match.
     */

    /*
     * Exact tournament ID supplied by the model/tool call.
     * Preserve it instead of treating it as an unresolved
     * conversational reference.
     */
    const exactCandidate =
      candidates.find(
        (candidate) =>
          candidate.id.toLowerCase() === normalized
      );

    if (exactCandidate) {
      return {
        resolved: true,
        value: exactCandidate.id,
        reason: "TITLE_MATCH",
      };
    }

    const matches =
      this.findTitleMatches(
        normalized,
        candidates
      );

    const firstMatch = matches[0];

    if (matches.length === 1 && firstMatch) {
      return {
        resolved: true,
        value: firstMatch.id,
        reason: "TITLE_MATCH",
      };
    }

    if (matches.length > 1) {
      return {
        resolved: false,
        reason: "AMBIGUOUS",
      };
    }

    return {
      resolved: false,
      reason: "NO_MATCH",
    };
  }

  private static getOrdinalIndex(
    value: string
  ): number | null {
    const normalized =
      value
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    /*
     * Natural-language ordinal references.
     *
     * The ordinal does not have to be the complete input.
     *
     * Examples:
     * - first
     * - first one
     * - the first tournament
     * - the tournament you mentioned first
     * - number one
     * - #1
     * - pehle wale
     * - jo sabse pehle bataya tha
     * - jo teesre number par tha
     * - पहला
     * - दूसरा
     * - तीसरा
     */

    const ordinalPatterns: Array<{
      index: number;
      patterns: RegExp[];
    }> = [
      {
        index: 0,
        patterns: [
          /\bfirst\b/,
          /\b1st\b/,
          /\bnumber\s*(?:one|1)\b/,
          /\bno\.?\s*(?:one|1)\b/,
          /#\s*1\b/,
          /\bpehla\b/,
          /\bpahla\b/,
          /\bpehle\b/,
          /\bpehli\b/,
          /पहला/,
          /पहले/,
          /पहली/,
          /\bstarting\s+(?:mein|me|from)\b/,
          /\bbeginning\b/,
          /\bat\s+the\s+beginning\b/,
          /\bstart\s+(?:mein|me|from)\b/,
          /\bshuru(?:at)?\s+(?:mein|me)\b/,
          /\bshuru\s+wala\b/,
          /शुरुआत/,
          /शुरू में/,
        ],
      },
      {
        index: 1,
        patterns: [
          /\bsecond\b/,
          /\b2nd\b/,
          /\bnumber\s*(?:two|2)\b/,
          /\bno\.?\s*(?:two|2)\b/,
          /#\s*2\b/,
          /\bdusra\b/,
          /\bdoosra\b/,
          /\bdusre\b/,
          /\bdoosre\b/,
          /\bdusri\b/,
          /\bdoosri\b/,
          /दूसरा/,
          /दूसरे/,
          /दूसरी/,
        ],
      },
      {
        index: 2,
        patterns: [
          /\bthird\b/,
          /\b3rd\b/,
          /\bnumber\s*(?:three|3)\b/,
          /\bno\.?\s*(?:three|3)\b/,
          /#\s*3\b/,
          /\bteesra\b/,
          /\btisra\b/,
          /\bteesre\b/,
          /\btisre\b/,
          /\bteesri\b/,
          /\btisri\b/,
          /तीसरा/,
          /तीसरे/,
          /तीसरी/,
        ],
      },
      {
        index: 3,
        patterns: [
          /\bfourth\b/,
          /\b4th\b/,
          /\bnumber\s*(?:four|4)\b/,
          /\bno\.?\s*(?:four|4)\b/,
          /#\s*4\b/,
          /\bchautha\b/,
          /\bchauthe\b/,
          /\bchauthi\b/,
          /चौथा/,
          /चौथे/,
          /चौथी/,
        ],
      },
      {
        index: 4,
        patterns: [
          /\bfifth\b/,
          /\b5th\b/,
          /\bnumber\s*(?:five|5)\b/,
          /\bno\.?\s*(?:five|5)\b/,
          /#\s*5\b/,
          /\bpaanchva\b/,
          /\bpanchva\b/,
          /\bpaanchve\b/,
          /\bpanchve\b/,
          /पाँचवाँ/,
          /पांचवां/,
          /पाँचवें/,
          /पांचवें/,
        ],
      },
    ];

    for (const ordinal of ordinalPatterns) {
      if (
        ordinal.patterns.some(
          (pattern) => pattern.test(normalized)
        )
      ) {
        return ordinal.index;
      }
    }

    /*
     * Plain numeric ordinal input.
     *
     * Keep this deliberately strict so that an unrelated number
     * inside a sentence is not automatically interpreted as a
     * tournament position.
     *
     * Examples:
     * - "1"
     * - "2"
     * - "3rd"
     */
    const numericMatch =
      normalized.match(/^(?:#\s*)?([1-5])(?:st|nd|rd|th)?$/);

    if (numericMatch) {
      return Number(numericMatch[1]) - 1;
    }

    return null;
  }

  private static isCurrentTournamentReference(
    value: string
  ): boolean {
    const normalized =
      value
        .replace(/\s+/g, " ")
        .trim();

    return [
      "isme",
      "is mein",
      "is tournament mein",
      "is tournament me",
      "isi mein",
      "isi tournament mein",
      "isi tournament me",
      "wahi",
      "wahi tournament",
      "same tournament",
      "this tournament",
      "that tournament",
    ].includes(normalized);
  }


  private static normalizeCandidates(
    candidates: unknown
  ): AgentCandidateTournament[] {
    if (!Array.isArray(candidates)) {
      return [];
    }

    return candidates.flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object") {
        return [];
      }

      const item = candidate as Record<string, unknown>;

      if (
        typeof item.id !== "string" ||
        typeof item.title !== "string"
      ) {
        return [];
      }

      return [
        {
          id: item.id,
          title: item.title,
          ...(typeof item.sport === "string"
            ? { sport: item.sport }
            : {}),
          ...(typeof item.city === "string"
            ? { city: item.city }
            : {}),
          ...(typeof item.entryFee === "number"
            ? { entryFee: item.entryFee }
            : {}),
        },
      ];
    });
  }

  private static findAttributeMatches(
    reference: string,
    candidates: AgentCandidateTournament[]
  ): AgentCandidateTournament[] {
    const normalizedReference =
      reference
        .toLowerCase()
        .replace(/[₹,]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const predicates: Array<
      (candidate: AgentCandidateTournament) => boolean
    > = [];

    /*
     * Attribute references should contain an explicit
     * attribute cue. This prevents normal tournament
     * titles such as "Jaipur Open Football Championship"
     * from being interpreted as attribute queries.
     */

    const hasAttributeCue =
      /\b(?:wala|wale|wali|ka|ke|ki|mein|me|in|at|jiska|jisme|jis|the one in|the one at)\b/i.test(
        normalizedReference
      ) ||
      /(?:entry\s*fee|fee|fees|price|cost)/i.test(
        normalizedReference
      ) ||
      /(?:₹|rs\.?|inr)\s*\d/i.test(
        normalizedReference
      ) ||
      /(?:the\s+)?[a-z][a-z\s-]*\s+tournament\b/i.test(
        normalizedReference
      );

    if (!hasAttributeCue) {
      return [];
    }

    /*
     * City attributes.
     *
     * Examples:
     * - Jaipur wala
     * - Jaipur ka tournament
     * - the one in Jaipur
     * - Jaipur wala football tournament
     */
    const knownCities: string[] = [
      ...new Set(
        candidates
          .map((candidate) =>
            candidate.city?.trim().toLowerCase()
          )
          .filter(
            (city): city is string =>
              Boolean(city)
          )
      ),
    ];

    const matchedCity =
      knownCities
        .filter((city) =>
          normalizedReference.includes(city)
        )
        .sort((a, b) => b.length - a.length)
        .at(0);

    if (matchedCity) {
      predicates.push((candidate) =>
        candidate.city?.trim().toLowerCase() === matchedCity
      );
    }

    /*
     * Sport attributes.
     *
     * Examples:
     * - football wala
     * - cricket tournament
     * - the football tournament
     */
    const knownSports: string[] = [
      ...new Set(
        candidates
          .map((candidate) =>
            candidate.sport?.trim().toLowerCase()
          )
          .filter(
            (sport): sport is string =>
              Boolean(sport)
          )
      ),
    ];

    const matchedSport =
      knownSports
        .filter((sport) =>
          normalizedReference.includes(sport)
        )
        .sort((a, b) => b.length - a.length)
        .at(0);

    if (matchedSport) {
      predicates.push((candidate) =>
        candidate.sport?.trim().toLowerCase() === matchedSport
      );
    }

    /*
     * Entry fee attributes.
     *
     * Supported:
     * - ₹1000 wala
     * - 1000 wala
     * - jiska entry fee 1000 hai
     * - entry fee 1000
     * - fee is 1000
     */
    const feeMatch =
      normalizedReference.match(
        /(?:entry\s*fee|fee|fees|price|cost)\s*(?:is|of|=|:)?\s*(\d+(?:\.\d+)?)|(?:rs\.?|inr)\s*(\d+(?:\.\d+)?)|\b(\d+(?:\.\d+)?)\s*(?:wala|wale|wali)\b/i
      );

    const feeValue =
      feeMatch
        ? Number(
            feeMatch[1] ??
            feeMatch[2] ??
            feeMatch[3]
          )
        : null;

    if (
      feeValue !== null &&
      Number.isFinite(feeValue)
    ) {
      predicates.push((candidate) =>
        candidate.entryFee === feeValue
      );
    }

    /*
     * A reference that contains an attribute cue but
     * no recognized candidate attribute should not
     * accidentally resolve through this layer.
     */
    if (predicates.length === 0) {
      return [];
    }

    return candidates.filter((candidate) =>
      predicates.every((predicate) =>
        predicate(candidate)
      )
    );
  }

  private static findTitleMatches(
    reference: string,
    candidates: AgentCandidateTournament[]
  ) {
    return candidates.filter(
      (candidate) => {
        const title =
          candidate.title
            .toLowerCase()
            .trim();

        return (
          title === reference ||
          title.includes(reference) ||
          reference.includes(title)
        );
      }
    );
  }
}

export const referenceResolverService =
  ReferenceResolverService;
