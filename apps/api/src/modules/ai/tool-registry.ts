import { Type } from "@google/genai";

import { tournamentTools } from "./tools/tournament.tools.js";
import { registrationTools } from "./tools/registration.tools.js";
import { paymentTools } from "./tools/payment.tools.js";
import { matchTools } from "./tools/match.tools.js";
import { crewTools } from "./tools/crew.tools.js";
import { userTools } from "./tools/user.tools.js";

import type {
  AgentContext,
  AgentToolResult,
} from "./types.js";


export const agentToolDeclarations = [
  {
    name: "search_tournaments",
    description:
      "Search for approved sports tournaments using available filters such as city, sport, and search text.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: {
          type: Type.STRING,
          description: "Optional tournament name or search text.",
        },
        city: {
          type: Type.STRING,
          description:
            "Optional city. Use the user's requested city for the initial search.",
        },
        state: {
          type: Type.STRING,
          description:
            "Optional state/region. Preserve this when broadening a search to nearby locations.",
        },
        nearby: {
          type: Type.BOOLEAN,
          description:
            "Set true only when the user asks for nearby, surrounding, alternative, or broader-location tournaments after the requested location has no suitable results. When true, do not require an exact city match; preserve the requested sport and state when available.",
        },
        sport: {
          type: Type.STRING,
          description: "Optional sport.",
        },
        status: {
          type: Type.STRING,
          description:
            "Optional tournament status: ONGOING, UPCOMING, or COMPLETED.",
        },
        startDateFrom: {
          type: Type.STRING,
          description:
            "Optional inclusive tournament start date/time lower bound in ISO-8601 format.",
        },
        startDateTo: {
          type: Type.STRING,
          description:
            "Optional inclusive tournament start date/time upper bound in ISO-8601 format.",
        },
        minEntryFee: {
          type: Type.NUMBER,
          description: "Optional minimum entry fee.",
        },
        maxEntryFee: {
          type: Type.NUMBER,
          description: "Optional maximum entry fee.",
        },
      },
    },
  },

  {
    name: "get_tournament",
    description:
      "Get complete details of a specific tournament.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tournamentId: {
          type: Type.STRING,
          description: "Tournament ID.",
        },
      },
      required: ["tournamentId"],
    },
  },

  {
    name: "register_for_tournament",
    description:
      "Register the authenticated player for a tournament.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tournamentId: {
          type: Type.STRING,
          description: "Tournament ID.",
        },
      },
      required: ["tournamentId"],
    },
  },

  {
    name: "get_my_registrations",
    description:
      "Get tournaments in which the authenticated player is registered.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },

  {
    name: "cancel_registration",
    description:
      "Cancel a tournament registration belonging to the authenticated player.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        registrationId: {
          type: Type.STRING,
          description: "Registration ID.",
        },
      },
      required: ["registrationId"],
    },
  },

  {
    name: "confirm_pending_registration",
    description:
      "Confirm a previously requested tournament registration after the player explicitly says yes, proceed, confirm, kar do, haan, or equivalent. This only confirms a pending registration from an earlier conversation turn.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },

  {
    name: "create_payment_order",
    description:
      "Create a payment order for the authenticated player for a paid tournament. This does not mean payment is completed.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tournamentId: {
          type: Type.STRING,
          description: "Tournament ID.",
        },
      },
      required: ["tournamentId"],
    },
  },

  {
    name: "get_match_details",
    description:
      "Get details and current score of a specific match.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        matchId: {
          type: Type.STRING,
          description: "Match ID.",
        },
      },
      required: ["matchId"],
    },
  },

  {
    name: "get_tournament_matches",
    description:
      "Get all matches scheduled for a tournament.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tournamentId: {
          type: Type.STRING,
          description: "Tournament ID.",
        },
      },
      required: ["tournamentId"],
    },
  },

  {
    name: "update_match_score",
    description:
      "Update the score or status of a match. Available only to authorized organizer, crew, or admin users.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        matchId: {
          type: Type.STRING,
          description: "Match ID.",
        },
        scoreA: {
          type: Type.NUMBER,
          description: "Optional score for team A.",
        },
        scoreB: {
          type: Type.NUMBER,
          description: "Optional score for team B.",
        },
        currentSet: {
          type: Type.NUMBER,
          description: "Optional current set number.",
        },
        status: {
          type: Type.STRING,
          description: "Optional match status.",
        },
        winner: {
          type: Type.STRING,
          description: "Optional winner.",
        },
      },
      required: ["matchId"],
    },
  },

  {
    name: "create_match",
    description:
      "Schedule a match for a tournament. Available only to organizers or admins.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        tournamentId: {
          type: Type.STRING,
          description: "Tournament ID.",
        },
        round: {
          type: Type.STRING,
          description: "Match round.",
        },
        matchNumber: {
          type: Type.NUMBER,
          description: "Match number.",
        },
        teamA: {
          type: Type.STRING,
          description: "Team or player A.",
        },
        teamB: {
          type: Type.STRING,
          description: "Team or player B.",
        },
        nextMatchId: {
          type: Type.STRING,
          description: "Optional next match ID.",
        },
      },
      required: [
        "tournamentId",
        "round",
        "matchNumber",
        "teamA",
        "teamB",
      ],
    },
  },

  {
    name: "get_available_crew",
    description:
      "Find available ground crew by city or sport.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: "Optional city.",
        },
        sport: {
          type: Type.STRING,
          description: "Optional sport.",
        },
      },
    },
  },

  {
    name: "register_crew",
    description:
      "Create a crew profile for the authenticated crew user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        fullName: {
          type: Type.STRING,
          description: "Crew member full name.",
        },
        role: {
          type: Type.STRING,
          description: "Crew role.",
        },
        sportsExpertise: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "Sports expertise.",
        },
        city: {
          type: Type.STRING,
          description: "City.",
        },
        state: {
          type: Type.STRING,
          description: "State.",
        },
        experienceYears: {
          type: Type.NUMBER,
          description: "Years of experience.",
        },
      },
      required: [
        "fullName",
        "role",
        "sportsExpertise",
        "city",
        "state",
        "experienceYears",
      ],
    },
  },

  {
    name: "update_crew_availability",
    description:
      "Update availability of the authenticated crew user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        isAvailable: {
          type: Type.BOOLEAN,
          description: "Whether the crew member is available.",
        },
      },
      required: ["isAvailable"],
    },
  },

  {
    name: "get_my_profile",
    description:
      "Get the authenticated player's profile information.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];


type ToolHandler = (
  args: any,
  context: AgentContext
) => Promise<AgentToolResult>;


export const agentToolHandlers: Record<string, ToolHandler> = {
  search_tournaments: (args, context) =>
    tournamentTools.searchTournaments(args, context),

  get_tournament: (args, context) =>
    tournamentTools.getTournament(args, context),

  register_for_tournament: (args, context) =>
    registrationTools.register(args, context),

  get_my_registrations: (args, context) =>
    registrationTools.getMyRegistrations(args, context),

  cancel_registration: (args, context) =>
    registrationTools.cancel(args, context),

  confirm_pending_registration: (args, context) =>
    registrationTools.confirmPendingRegistration(args, context),

  create_payment_order: (args, context) =>
    paymentTools.createOrder(args, context),

  get_match_details: (args, context) =>
    matchTools.getMatchDetails(args, context),

  get_tournament_matches: (args, context) =>
    matchTools.getTournamentMatches(args, context),

  update_match_score: (args, context) =>
    matchTools.updateScore(args, context),

  create_match: (args, context) =>
    matchTools.createMatch(args, context),

  get_available_crew: (args, context) =>
    crewTools.getAvailableCrew(args, context),

  register_crew: (args, context) =>
    crewTools.registerCrew(args, context),

  update_crew_availability: (args, context) =>
    crewTools.updateAvailability(args, context),

  get_my_profile: (args, context) =>
    userTools.getMyProfile(args, context),
};

/**
 * Tools exposed to the authenticated PLAYER agent.
 *
 * Keep this list intentionally limited to player capabilities.
 * The underlying tool handlers remain shared with the default agent.
 */
const PLAYER_TOOL_NAMES = new Set([
  "search_tournaments",
  "get_tournament",
  "register_for_tournament",
  "get_my_registrations",
  "cancel_registration",
  "confirm_pending_registration",
  "create_payment_order",
  "get_match_details",
  "get_tournament_matches",
  "get_my_profile",
]);

export const playerToolDeclarations =
  agentToolDeclarations.filter((tool) =>
    PLAYER_TOOL_NAMES.has(tool.name)
  );

export const playerToolHandlers: Record<string, ToolHandler> =
  Object.fromEntries(
    Object.entries(agentToolHandlers).filter(([name]) =>
      PLAYER_TOOL_NAMES.has(name)
    )
  );
