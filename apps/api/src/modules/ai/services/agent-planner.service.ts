import { gemini, GEMINI_MODEL } from "./gemini.service.js";

import {
  AgentPlanValidatorService,
} from "./agent-plan-validator.service.js";

import type {
  AgentContext,
  AgentGoal,
  AgentPlan,
} from "../types.js";

const PLANNER_SYSTEM_PROMPT = `
You are the Sportora PLAYER workflow planner.

Your job is ONLY to create an execution plan.
You do NOT execute tools.
You do NOT decide whether an operation is allowed.
You do NOT claim payment success.

Return ONLY a valid AgentPlan JSON object.

Rules:
- Create the smallest goal-oriented plan required to achieve the goal.
- NEVER return an empty steps array.
- Every valid plan MUST contain at least one step.
- currentStepId MUST always reference an existing step.
- The first step MUST be the first executable or reasoning action required to advance the goal.
- For tournament discovery or registration goals with sport and city available, create SEARCH_TOURNAMENTS as the first step.
- If the player's own city is required and unavailable, create GET_PROFILE as the first step.
- Never return steps: [].
- If the goal is actionable, do not return an empty plan.
- If the goal status is FAILED, treat this as a recovery/replanning request.
- Use lastObservation to understand why the previous approach failed.
- Use completedSteps and the previous plan to avoid blindly repeating the failed approach.
- Create an alternative plan that addresses the observed failure.
- Do not assume the failure is resolved unless the new plan contains an action or checkpoint that can establish recovery.
- Use only actions relevant to the supplied goal.
- Tool names must be actual Sportora PLAYER tools.
- For DISCOVER_TOURNAMENT, use SEARCH_TOURNAMENTS directly when the city/sport is already known.
- When a tournament discovery search returns zero suitable results for the requested city/location, do NOT automatically broaden the search.
- Preserve the previous tournament search context in lastTournamentSearch when replanning or continuing a tournament discovery conversation.
- If the user's latest message explicitly agrees to checking nearby or alternative locations, use lastTournamentSearch to recover the previous sport, city, state, status, date range, and entry-fee constraints.
- For an affirmative nearby request, create a SEARCH_TOURNAMENTS step with nearby=true.
- When nearby=true, remove the previous exact city restriction but preserve the previous state/region and all other compatible constraints.
- Never ask for the city or sport again when lastTournamentSearch already contains that information.
- After a zero-result location-specific search, ask the player whether they want nearby or alternative locations checked.
- Treat an explicit affirmative response such as "yes", "haan", "sure", "nearby", "check nearby", or equivalent as permission to broaden the tournament search.
- When the player explicitly requests nearby/alternative locations, use SEARCH_TOURNAMENTS with nearby=true.
- When broadening a search, preserve the requested sport, state/region, date range, tournament status, and entry-fee constraints whenever available.
- When nearby=true, do not require an exact city match.
- Never claim that a nearby tournament exists unless SEARCH_TOURNAMENTS actually returns it.
- For requests containing "ongoing", "live", "currently going on", "right now", or equivalent wording, set the search_tournaments status to "ONGOING".
- For requests asking for upcoming tournaments, set the search_tournaments status to "UPCOMING".
- For requests asking for completed/past tournaments, set the search_tournaments status to "COMPLETED".
- The runtime.currentDateTime and runtime.currentDate values supplied with the request are authoritative for relative date expressions.
- Resolve relative dates such as "today", "tomorrow", "this week", "this weekend", "next week", and "next weekend" using the supplied runtime date.
- Do not invent the current date or assume a different year.
- For date-specific tournament discovery, use startDateFrom and startDateTo when those fields are available.
- For "on <date>", use that calendar date as the start-date range.
- For "in <month>", use the first and last day of that month.
- For "this week", use the current week's date range.
- For "next week", use the next calendar week's date range.
- For "this weekend", use the relevant Saturday/Sunday date range.
- Preserve other filters such as sport, city, state, status and entry fee when adding a date range.
- If a requested date or date range cannot be safely resolved, use ASK_USER rather than guessing.
- If the discovery request requires the player's own city and the city is not known, first use GET_PROFILE with toolName get_my_profile, then use SEARCH_TOURNAMENTS with toolName search_tournaments.
- Never use a tool name as the action name. The action must be a valid workflow action such as GET_PROFILE or SEARCH_TOURNAMENTS.
- get_my_profile is a toolName, not a plan action.
- search_tournaments is a toolName, not a plan action.
- SELECT_TOURNAMENT is a reasoning/checkpoint step and has no toolName.
- VERIFY_PAYMENT is a verification checkpoint and has no toolName.
- VERIFY_REGISTRATION is a verification checkpoint and has no toolName.
- Never create a tool for payment verification.
- Never invent tools.
- Payment order creation must happen only after explicit confirmation.
- Verification must happen after payment order creation.
- Every dependency must reference an earlier step.
- Start with the first executable/reasoning step.
- Do not mark newly generated steps as COMPLETED or FAILED.

For every plan step when applicable:
- Define the required information needed by the step.
- Define relevant constraints.
- Define measurable success criteria.
- Define backend verification criteria.
- Define what should happen if the step fails.
- Use RETRY only for potentially transient failures.
- Use REPLAN when another strategy may achieve the goal.
- Use ASK_USER when required information cannot be safely inferred.
- Use STOP when continuing would be unsafe or impossible.
- requiresUserInput must be true only when explicit player interaction is required.
- Success criteria describe what must be observed.
- Verification criteria describe what the backend must confirm.
- Never use success criteria as proof that an operation actually succeeded.
- Never use planner output as proof of payment or registration success.

Allowed player tools:
search_tournaments
get_tournament
register_for_tournament
get_my_registrations
cancel_registration
confirm_pending_registration
create_payment_order
get_match_details
get_tournament_matches
get_my_profile
`;

function planSchema() {
  return {
    type: "object",
    properties: {
      version: {
        type: "integer",
      },
      steps: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            action: { type: "string" },
            description: { type: "string" },
            status: {
              type: "string",
              enum: ["PENDING"],
            },
            toolName: { type: "string" },

            dependsOn: {
              type: "array",
              items: { type: "string" },
            },

            requiredInformation: {
              type: "array",
              items: { type: "string" },
            },

            constraints: {
              type: "object",
            },

            successCriteria: {
              type: "array",
              items: { type: "string" },
            },

            verificationCriteria: {
              type: "array",
              items: { type: "string" },
            },

            failureStrategy: {
              type: "string",
              enum: [
                "RETRY",
                "REPLAN",
                "ASK_USER",
                "STOP",
              ],
            },

            requiresUserInput: {
              type: "boolean",
            },
          },

          required: [
            "id",
            "action",
            "description",
            "status",
          ],
        },
      },
      currentStepId: {
        type: "string",
      },
    },
    required: [
      "version",
      "steps",
      "currentStepId",
    ],
  };
}

export class AgentPlannerService {
  public static async createDynamicPlan(
    goal: AgentGoal,
    context: AgentContext
  ): Promise<AgentPlan> {
    const response =
      await gemini.models.generateContent({
        model: GEMINI_MODEL,

        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  runtime: {
                    currentDateTime: new Date().toISOString(),
                    currentDate:
                      new Date().toISOString().slice(0, 10),
                    timezone:
                      Intl.DateTimeFormat().resolvedOptions().timeZone ||
                      "UTC",
                  },
                  goal: {
                    type: goal.type,
                    status: goal.status,
                    description: goal.description,
                    constraints: goal.constraints,
                    requiredInformation:
                      goal.requiredInformation ?? null,
                    completedSteps:
                      goal.completedSteps ?? null,
                    pendingAction:
                      goal.pendingAction ?? null,
                    lastObservation:
                      goal.lastObservation ?? null,
                    lastTournamentSearch:
                      (goal as AgentGoal & {
                        lastTournamentSearch?: unknown;
                      }).lastTournamentSearch ?? null,
                    plan: goal.plan
                      ? {
                          version:
                            goal.plan.version,
                          steps:
                            goal.plan.steps.map(
                              (step) => ({
                                id: step.id,
                                action: step.action,
                                description:
                                  step.description,
                                status: step.status,
                                ...(step.toolName != null
                                  ? {
                                      toolName:
                                        step.toolName,
                                    }
                                  : {}),
                                ...(step.dependsOn != null
                                  ? {
                                      dependsOn:
                                        [...step.dependsOn],
                                    }
                                  : {}),

                                ...(step.requiredInformation != null
                                  ? {
                                      requiredInformation:
                                        [...step.requiredInformation],
                                    }
                                  : {}),

                                ...(step.constraints != null
                                  ? {
                                      constraints:
                                        { ...step.constraints },
                                    }
                                  : {}),

                                ...(step.successCriteria != null
                                  ? {
                                      successCriteria:
                                        [...step.successCriteria],
                                    }
                                  : {}),

                                ...(step.verificationCriteria != null
                                  ? {
                                      verificationCriteria:
                                        [...step.verificationCriteria],
                                    }
                                  : {}),

                                ...(step.failureStrategy != null
                                  ? {
                                      failureStrategy:
                                        step.failureStrategy,
                                    }
                                  : {}),

                                ...(step.requiresUserInput != null
                                  ? {
                                      requiresUserInput:
                                        step.requiresUserInput,
                                    }
                                  : {}),

                                ...(step.observation != null
                                  ? {
                                      observation:
                                        step.observation,
                                    }
                                  : {}),
                              })
                            ),
                          currentStepId:
                            goal.plan.currentStepId,
                        }
                      : undefined,
                  },
                  context: {
                    userId: context.user.id,
                    conversationId:
                      context.conversationId,
                  },
                }),
              },
            ],
          },
        ],

        config: {
          systemInstruction:
            PLANNER_SYSTEM_PROMPT,

          responseMimeType:
            "application/json",

          responseSchema:
            planSchema(),
        },
      });

    const raw =
      response.text?.trim();

    if (!raw) {
      throw new Error(
        "Planner returned an empty response."
      );
    }

    let parsed: AgentPlan;

    try {
      parsed = JSON.parse(raw) as AgentPlan;
    } catch {
      throw new Error(
        "Planner returned invalid JSON."
      );
    }

    /*
     * Gemini can occasionally return a syntactically valid but
     * unusable empty plan. Do not allow that to break the entire
     * PLAYER workflow with a 500.
     *
     * Build a deterministic discovery fallback when the current
     * goal already contains enough information to search.
     */
    if (
      (!Array.isArray(parsed.steps) || parsed.steps.length === 0) &&
      goal.type === "REGISTER_TOURNAMENT" &&
      typeof goal.constraints?.sport === "string" &&
      goal.constraints.sport.trim() &&
      typeof goal.constraints?.city === "string" &&
      goal.constraints.city.trim()
    ) {
      parsed = {
        version: 1,
        steps: [
          {
            id: "search-tournaments",
            action: "SEARCH_TOURNAMENTS",
            description:
              `Find suitable ${goal.constraints.sport} tournaments in ${goal.constraints.city}.`,
            status: "PENDING",
            toolName: "search_tournaments",
            requiredInformation: [
              "sport",
              "city",
            ],
            constraints: {
              sport: goal.constraints.sport,
              city: goal.constraints.city,
            },
            successCriteria: [
              "Tournament search completes successfully.",
              "Search results are returned for the requested criteria.",
            ],
            verificationCriteria: [
              "Backend search tool returns a valid tournament result set.",
            ],
            failureStrategy: "REPLAN",
            requiresUserInput: false,
          },
        ],
        currentStepId: "search-tournaments",
      };
    }

    const plan: AgentPlan = {
      ...parsed,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validation =
      AgentPlanValidatorService.validate(
        plan
      );

    if (!validation.valid) {
      console.error("========== INVALID DYNAMIC AGENT PLAN ==========");
      console.error("RAW GEMINI PLAN:");
      console.error(JSON.stringify(parsed, null, 2));
      console.error("VALIDATION ERRORS:");
      console.error(validation.errors);
      console.error("================================================");

      throw new Error(
        `Invalid dynamic agent plan: ${validation.errors.join("; ")}`
      );
    }

    return plan;
  }
}

export const agentPlannerService =
  AgentPlannerService;
