import { aiRepository } from "../repositories/ai.repository.js";

import type {
  AgentContext,
  AgentGoal,
  AgentGoalType,
  AgentIntent,
  AgentToolResult,
} from "../types.js";

export class AgentStateService {

  public static async recordUserMessage(
    prompt: string,
    context: AgentContext
  ) {
    if (!context.conversationId) {
      return;
    }

    await aiRepository.updateAgentState(
      context.conversationId,
      {
        lastUserMessage: prompt.trim(),
      }
    );
  }

  public static async recordToolResult(
    toolName: string,
    result: AgentToolResult,
    context: AgentContext,
    toolArgs?: Record<string, unknown>
  ) {
    if (!context.conversationId) {
      return;
    }

    const previousState =
      await aiRepository.getAgentState(
        context.conversationId
      );

    const state = result.success
      ? this.deriveState(
          toolName,
          result,
          previousState,
          toolArgs
        )
      : this.deriveFailureState(
          toolName,
          result,
          previousState
        );

    const previousPlan =
      previousState?.goal?.plan
        ? {
            version:
              previousState.goal.plan.version,
            steps:
              previousState.goal.plan.steps.map(
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
                  ...(step.dependsOn
                    ? {
                        dependsOn:
                          [...step.dependsOn],
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).requiredInformation
                    ? {
                        requiredInformation:
                          [...((step as unknown as import('../types.js').AgentPlanStep).requiredInformation ?? [])],
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).constraints
                    ? {
                        constraints:
                          { ...(step as unknown as import('../types.js').AgentPlanStep).constraints },
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).successCriteria
                    ? {
                        successCriteria:
                          [...((step as unknown as import('../types.js').AgentPlanStep).successCriteria ?? [])],
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).verificationCriteria
                    ? {
                        verificationCriteria:
                          [...((step as unknown as import('../types.js').AgentPlanStep).verificationCriteria ?? [])],
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).failureStrategy != null
                    ? {
                        failureStrategy:
                          (step as unknown as import('../types.js').AgentPlanStep).failureStrategy,
                      }
                    : {}),
                  ...((step as unknown as import('../types.js').AgentPlanStep).requiresUserInput != null
                    ? {
                        requiresUserInput:
                          (step as unknown as import('../types.js').AgentPlanStep).requiresUserInput,
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
            ...(previousState.goal.plan.currentStepId != null
              ? {
                  currentStepId:
                    previousState.goal.plan.currentStepId,
                }
              : {}),
            ...(previousState.goal.plan.createdAt != null
              ? {
                  createdAt:
                    previousState.goal.plan.createdAt,
                }
              : {}),
            ...(previousState.goal.plan.updatedAt != null
              ? {
                  updatedAt:
                    previousState.goal.plan.updatedAt,
                }
              : {}),
          }
        : undefined;

    const currentPlan =
      previousPlan;

    const updatedPlan =
      this.updatePlanAfterTool(
        currentPlan,
        toolName,
        result.success,
        result.message
      );

    if (state.goal && updatedPlan) {
      state.goal = {
        ...state.goal,
        plan: updatedPlan as any,
      } as any;
    }

    await aiRepository.updateAgentState(
      context.conversationId,
      state as any
    );
  }

  private static deriveFailureState(
    toolName: string,
    result: AgentToolResult,
    previousState: Awaited<
      ReturnType<typeof aiRepository.getAgentState>
    >
  ) {
    const observation =
      result.message ??
      "The requested operation could not be completed.";

    const needsClarification =
      /not found|could not identify|multiple|ambiguous|specify|invalid|missing|required/i.test(
        observation
      );

    const status =
      needsClarification
        ? "NEEDS_CLARIFICATION" as const
        : "FAILED" as const;

    const previousGoal =
      previousState?.goal;

    if (previousGoal) {
      const preservedGoal =
        JSON.parse(
          JSON.stringify(previousGoal)
        ) as AgentGoal;

      return {
        ...(previousState?.activeIntent
          ? {
              activeIntent:
                previousState.activeIntent,
            }
          : {}),
        activeEntity:
          previousState?.activeEntity?.type &&
          previousState?.activeEntity?.id
            ? {
                type:
                  previousState.activeEntity.type,
                id:
                  previousState.activeEntity.id,
                ...(previousState.activeEntity.label != null
                  ? {
                      label:
                        previousState.activeEntity.label,
                    }
                  : {}),
              }
            : null,

        ...(previousState?.lastTournamentSearch
          ? {
              lastTournamentSearch:
                JSON.parse(
                  JSON.stringify(
                    previousState.lastTournamentSearch
                  )
                ),
            }
          : {}),

        candidateTournaments:
          previousState?.candidateTournaments
            ? JSON.parse(
                JSON.stringify(
                  previousState.candidateTournaments
                )
              )
            : [],
        goal: {
          ...preservedGoal,
          status,
          lastObservation:
            observation,
          ...(needsClarification
            ? {
                pendingAction:
                  preservedGoal.pendingAction ??
                  "CLARIFY",
              }
            : {}),
          updatedAt: new Date(),
        },
        lastTool: toolName,
      };
    }

    return {
      goal: {
        type:
          "DISCOVER_TOURNAMENT" as AgentGoalType,
        status,
        description:
          observation,
        lastObservation:
          observation,
        updatedAt: new Date(),
      },
      lastTool: toolName,
    };
  }

  private static normalizeTournamentSearchContext(
    args?: Record<string, unknown>
  ) {
    if (!args) {
      return undefined;
    }

    const result: Record<string, unknown> = {};

    const stringFields = [
      "search",
      "sport",
      "city",
      "state",
      "status",
      "startDateFrom",
      "startDateTo",
    ];

    for (const field of stringFields) {
      const value = args[field];

      if (typeof value === "string" && value.trim()) {
        result[field] = value.trim();
      }
    }

    if (typeof args.nearby === "boolean") {
      result.nearby = args.nearby;
    }

    const numberFields = [
      "minEntryFee",
      "maxEntryFee",
    ];

    for (const field of numberFields) {
      const value = args[field];

      if (
        typeof value === "number" &&
        Number.isFinite(value)
      ) {
        result[field] = value;
      }
    }

    return result;
  }

  private static deriveState(
    toolName: string,
    result: AgentToolResult,
    previousState: Awaited<
      ReturnType<typeof aiRepository.getAgentState>
    >,
    toolArgs?: Record<string, unknown>
  ) {
    switch (toolName) {

      case "search_tournaments":
        return {
          activeIntent:
            "TOURNAMENT_DISCOVERY" as AgentIntent,

          lastTournamentSearch:
            this.normalizeTournamentSearchContext(toolArgs),

          candidateTournaments:
            this.extractTournamentCandidates(result),
          goal:
            this.createGoal(
              "DISCOVER_TOURNAMENT",
              "DISCOVERING",
              "Find suitable tournaments for the player.",
              {
                completedSteps: ["SEARCH_TOURNAMENTS"],
                lastObservation:
                  result.message ??
                  "Tournament search completed.",
              }
            ),
          lastTool: toolName,
        };

      case "get_tournament":
        return {
          activeIntent:
            "TOURNAMENT_DETAILS" as AgentIntent,
          activeEntity:
            this.extractTournamentEntity(result) ?? null,
          goal:
            this.createGoal(
              "VIEW_TOURNAMENT",
              "VIEWING_DETAILS",
              "Understand the selected tournament.",
              {
                completedSteps: ["GET_TOURNAMENT"],
                lastObservation:
                  result.message ??
                  "Tournament details retrieved.",
              }
            ),
          lastTool: toolName,
        };

      case "register_for_tournament": {
        const data = result.data as any;

        const tournamentId =
          data?.tournamentId;

        const requiresConfirmation =
          data?.confirmationRequired === true ||
          data?.paymentRequired === true;

        return {
          activeIntent:
            "TOURNAMENT_REGISTRATION" as AgentIntent,
          activeEntity:
            tournamentId
              ? {
                  type: "TOURNAMENT" as const,
                  id: String(tournamentId),
                }
              : null,
          goal:
            requiresConfirmation
              ? this.createGoal(
                  "REGISTER_TOURNAMENT",
                  "WAITING_CONFIRMATION",
                  "Register the player for the selected tournament.",
                  {
                    completedSteps: [
                      "SELECT_TOURNAMENT",
                      "REGISTRATION_REQUEST",
                    ],
                    pendingAction:
                      "CONFIRM_PAYMENT",
                    lastObservation:
                      result.message ??
                      "Registration requires payment confirmation.",
                  }
                )
              : this.createGoal(
                  "REGISTER_TOURNAMENT",
                  "VERIFYING",
                  "Register the player for the selected tournament.",
                  {
                    completedSteps: [
                      "SELECT_TOURNAMENT",
                      "REGISTRATION",
                    ],
                    pendingAction:
                      "VERIFY_REGISTRATION",
                    lastObservation:
                      result.message ??
                      "Registration request completed; backend verification is required.",
                  }
                ),
          lastTool: toolName,
        };
      }

      case "confirm_pending_registration": {
        const data = result.data as any;

        const tournamentId =
          data?.tournamentId;

        return {
          activeIntent:
            "TOURNAMENT_REGISTRATION" as AgentIntent,
          activeEntity:
            tournamentId
              ? {
                  type: "TOURNAMENT" as const,
                  id: String(tournamentId),
                }
              : null,
          goal:
            this.createGoal(
              "REGISTER_TOURNAMENT",
              "PAYMENT_READY",
              "Complete registration for the selected paid tournament.",
              {
                completedSteps: [
                  "SELECT_TOURNAMENT",
                  "REGISTRATION_REQUEST",
                  "PAYMENT_CONFIRMATION",
                ],
                pendingAction:
                  "CREATE_PAYMENT_ORDER",
                lastObservation:
                  result.message ??
                  "Registration payment was explicitly confirmed.",
              }
            ),
          lastTool: toolName,
        };
      }

      case "create_payment_order": {
        const tournamentId =
          this.extractTournamentId(result);

        return {
          activeIntent:
            "TOURNAMENT_REGISTRATION" as AgentIntent,
          activeEntity:
            tournamentId
              ? {
                  type: "TOURNAMENT" as const,
                  id: String(tournamentId),
                }
              : null,
          goal:
            this.createGoal(
              "REGISTER_TOURNAMENT",
              "PAYMENT_PENDING",
              "Complete payment for the selected tournament registration.",
              {
                completedSteps: [
                  "SELECT_TOURNAMENT",
                  "REGISTRATION_REQUEST",
                  "PAYMENT_CONFIRMATION",
                  "PAYMENT_ORDER_CREATED",
                ],
                pendingAction:
                  "COMPLETE_PAYMENT",
                lastObservation:
                  result.message ??
                  "Payment order created; actual payment is still pending.",
              }
            ),
          lastTool: toolName,
        };
      }

      case "get_my_registrations":
        return {
          activeIntent:
            "REGISTRATION_STATUS" as AgentIntent,
          goal:
            this.createGoal(
              "CHECK_REGISTRATIONS",
              "COMPLETED",
              "Check the player's tournament registrations.",
              {
                completedSteps: [
                  "GET_MY_REGISTRATIONS",
                ],
                lastObservation:
                  result.message ??
                  "Registrations retrieved.",
              }
            ),
          lastTool: toolName,
        };

      case "cancel_registration":
        return {
          activeIntent:
            "REGISTRATION_CANCELLATION" as AgentIntent,
          goal:
            this.createGoal(
              "CANCEL_REGISTRATION",
              "COMPLETED",
              "Cancel the selected tournament registration.",
              {
                completedSteps: [
                  "CANCEL_REGISTRATION",
                ],
                lastObservation:
                  result.message ??
                  "Registration cancelled.",
              }
            ),
          lastTool: toolName,
        };

      case "get_my_profile": {
        /*
         * Profile lookup can be an intermediate observation for another
         * workflow, especially:
         *
         *   GET_PROFILE -> SEARCH_TOURNAMENTS
         *
         * Preserve the actual profile data in the observation so the
         * next planner iteration can safely resolve requests such as:
         *
         *   "near me"
         *   "in my city"
         *   "in my area"
         *
         * without asking the user for information we already have.
         */
        const profileData =
          result.data &&
          typeof result.data === "object"
            ? result.data as Record<string, unknown>
            : null;

        const profileObservation = [
          result.message ??
            "Profile retrieved successfully.",
          profileData?.city
            ? `Player city: ${String(profileData.city)}.`
            : "Player city is not available.",
          profileData?.state
            ? `Player state: ${String(profileData.state)}.`
            : "Player state is not available.",
        ].join(" ");

        /*
         * IMPORTANT:
         * GET_PROFILE can be an intermediate step of tournament discovery.
         *
         * Example:
         *   "show football tournaments near me"
         *        -> GET_PROFILE
         *        -> SEARCH_TOURNAMENTS
         *
         * Do NOT replace DISCOVER_TOURNAMENT with VIEW_PROFILE here.
         * Preserve the original discovery goal and attach the real
         * player location as runtime constraints for the next planner
         * iteration.
         */
        const previousGoal =
          previousState?.goal;

        if (
          previousGoal?.type ===
          "DISCOVER_TOURNAMENT"
        ) {
          const existingConstraints =
            previousGoal.constraints ?? {};

          const discoveryConstraints = {
            ...existingConstraints,
            ...(profileData?.city
              ? {
                  playerCity:
                    String(profileData.city),
                }
              : {}),
            ...(profileData?.state
              ? {
                  playerState:
                    String(profileData.state),
                }
              : {}),
          };

          return {
            activeIntent:
              "TOURNAMENT_DISCOVERY" as AgentIntent,
            activeEntity:
              previousState?.activeEntity?.id &&
              previousState?.activeEntity?.type
                ? {
                    id:
                      String(
                        previousState.activeEntity.id
                      ),
                    type:
                      previousState.activeEntity.type,
                    ...(previousState.activeEntity.label != null
                      ? {
                          label:
                            String(
                              previousState.activeEntity.label
                            ),
                        }
                      : {}),
                  }
                : null,
            candidateTournaments:
              previousState?.candidateTournaments
                ? JSON.parse(
                    JSON.stringify(
                      previousState.candidateTournaments
                    )
                  )
                : [],
            goal: {
              ...previousGoal,
              type:
                previousGoal.type ??
                "DISCOVER_TOURNAMENT",
              status:
                "IN_PROGRESS" as const,
              constraints:
                discoveryConstraints,
              completedSteps: [
                ...(previousGoal.completedSteps ?? []),
                "GET_PROFILE",
              ],
              lastObservation:
                profileObservation,
              pendingAction:
                "SEARCH_TOURNAMENTS",
              updatedAt: new Date(),
            },
            lastTool: toolName,
          };
        }

        return {
          activeIntent:
            "PROFILE" as AgentIntent,
          goal:
            this.createGoal(
              "VIEW_PROFILE",
              "COMPLETED",
              "Retrieve the player's Sportora profile.",
              {
                completedSteps: [
                  "GET_PROFILE",
                ],
                lastObservation:
                  profileObservation,
                ...(profileData?.city
                  ? {
                      constraints: {
                        playerCity:
                          String(profileData.city),
                        ...(profileData?.state
                          ? {
                              playerState:
                                String(profileData.state),
                            }
                          : {}),
                      },
                    }
                  : {}),
              }
            ),
          lastTool: toolName,
        };
      }

      case "get_match_details":
      case "get_tournament_matches":
        return {
          activeIntent:
            "MATCH" as AgentIntent,
          goal:
            this.createGoal(
              "CHECK_MATCH",
              "COMPLETED",
              "Retrieve match information for the player.",
              {
                completedSteps: [
                  "GET_MATCH_INFORMATION",
                ],
                lastObservation:
                  result.message ??
                  "Match information retrieved.",
              }
            ),
          lastTool: toolName,
        };

      default:
        return {
          lastTool: toolName,
        };
    }
  }

  private static updatePlanAfterTool(
    plan: AgentGoal["plan"],
    toolName: string,
    success: boolean,
    observation?: string
  ): AgentGoal["plan"] {
    if (!plan) {
      return undefined;
    }

    const updatedSteps =
      plan.steps.map((step) => {
        if (step.toolName !== toolName) {
          return step;
        }

        return {
          ...step,
          status: success
            ? "COMPLETED" as const
            : "FAILED" as const,
          ...(observation
            ? { observation }
            : {}),
        };
      });

    /*
     * After a tool completes, move the plan cursor to the next
     * pending step whose dependencies are satisfied.
     *
     * Tool-less steps such as SELECT_TOURNAMENT are checkpoints:
     * they become the current step but are not marked completed
     * automatically.
     *
     * This is deliberately dependency-driven rather than based on
     * the previous currentStepId. That allows the cursor to move
     * forward after the tool that occupied the previous step has
     * completed.
     */
    const nextStep =
      updatedSteps.find(
        (step) =>
          step.status === "PENDING" &&
          (step.dependsOn ?? []).every(
            (dependency) =>
              updatedSteps.find(
                (candidate) =>
                  candidate.id === dependency
              )?.status === "COMPLETED"
          )
      );

    return {
      ...plan,
      steps: updatedSteps,
      ...(nextStep
        ? { currentStepId: nextStep.id }
        : {}),
      updatedAt: new Date(),
    };
  }

  private static createGoal(
    type: AgentGoalType,
    status: AgentGoal["status"],
    description: string,
    options: {
      constraints?: Record<string, unknown>;
      requiredInformation?: string[];
      completedSteps?: string[];
      pendingAction?: string;
      lastObservation?: string;
    } = {}
  ): AgentGoal {
    return {
      type,
      status,
      description,
      ...(options.constraints
        ? {
            constraints:
              options.constraints,
          }
        : {}),
      ...(options.requiredInformation
        ? {
            requiredInformation:
              options.requiredInformation,
          }
        : {}),
      ...(options.completedSteps
        ? {
            completedSteps:
              options.completedSteps,
          }
        : {}),
      ...(options.pendingAction
        ? {
            pendingAction:
              options.pendingAction,
          }
        : {}),
      ...(options.lastObservation
        ? {
            lastObservation:
              options.lastObservation,
          }
        : {}),
      updatedAt: new Date(),
    };
  }

  private static extractTournamentCandidates(
    result: AgentToolResult
  ) {
    const data = result.data as any;

    const tournaments =
      data?.tournaments ??
      data?.data?.tournaments;

    if (!Array.isArray(tournaments)) {
      return [];
    }

    return tournaments.map((tournament: any) => ({
      id: String(
        tournament._id ??
        tournament.id
      ),
      title: String(
        tournament.title ??
        "Tournament"
      ),
      ...(tournament.sport
        ? { sport: tournament.sport }
        : {}),
      ...(tournament.city
        ? { city: tournament.city }
        : {}),
      ...(tournament.entryFee !== undefined
        ? { entryFee: tournament.entryFee }
        : {}),
    }));
  }

  private static extractTournamentEntity(
    result: AgentToolResult
  ) {
    const data = result.data as any;

    const tournament =
      data?.tournament ??
      data?.data ??
      data;

    const id =
      tournament?.tournamentId ??
      tournament?._id ??
      tournament?.id;

    if (!id) {
      return undefined;
    }

    return {
      type: "TOURNAMENT" as const,
      id: String(id),
      ...(tournament?.title
        ? { label: String(tournament.title) }
        : {}),
    };
  }

  private static extractTournamentId(
    result: AgentToolResult
  ) {
    const data = result.data as any;

    return (
      data?.tournamentId ??
      data?.tournament?.tournamentId ??
      data?.tournament?._id ??
      data?.tournament?.id
    );
  }
}

export const agentStateService =
  AgentStateService;
