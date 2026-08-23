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
- If the goal status is FAILED, treat this as a recovery/replanning request.
- Use lastObservation to understand why the previous approach failed.
- Use completedSteps and the previous plan to avoid blindly repeating the failed approach.
- Create an alternative plan that addresses the observed failure.
- Do not assume the failure is resolved unless the new plan contains an action or checkpoint that can establish recovery.
- Use only actions relevant to the supplied goal.
- Tool names must be actual Sportora PLAYER tools.
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
      throw new Error(
        `Invalid dynamic agent plan: ${validation.errors.join("; ")}`
      );
    }

    return plan;
  }
}

export const agentPlannerService =
  AgentPlannerService;
