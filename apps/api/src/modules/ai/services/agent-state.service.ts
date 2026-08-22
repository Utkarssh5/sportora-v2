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
    context: AgentContext
  ) {
    if (!context.conversationId) {
      return;
    }

    const state = result.success
      ? this.deriveState(
          toolName,
          result
        )
      : this.deriveFailureState(
          toolName,
          result
        );

    await aiRepository.updateAgentState(
      context.conversationId,
      state
    );
  }

  private static deriveFailureState(
    toolName: string,
    result: AgentToolResult
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

    switch (toolName) {
      case "search_tournaments":
        return {
          activeIntent:
            "TOURNAMENT_DISCOVERY" as AgentIntent,
          goal:
            this.createGoal(
              "DISCOVER_TOURNAMENT",
              status,
              "Find suitable tournaments for the player.",
              {
                lastObservation: observation,
                ...(needsClarification
                  ? { pendingAction: "CLARIFY_SEARCH" }
                  : {}),
              }
            ),
          lastTool: toolName,
        };

      case "get_tournament":
        return {
          activeIntent:
            "TOURNAMENT_DETAILS" as AgentIntent,
          goal:
            this.createGoal(
              "VIEW_TOURNAMENT",
              status,
              "Understand the selected tournament.",
              {
                lastObservation: observation,
                ...(needsClarification
                  ? { pendingAction: "CLARIFY_TOURNAMENT" }
                  : {}),
              }
            ),
          lastTool: toolName,
        };

      case "register_for_tournament":
        return {
          activeIntent:
            "TOURNAMENT_REGISTRATION" as AgentIntent,
          goal:
            this.createGoal(
              "REGISTER_TOURNAMENT",
              status,
              "Register the player for the selected tournament.",
              {
                lastObservation: observation,
                ...(needsClarification
                  ? { pendingAction: "CLARIFY_REGISTRATION" }
                  : {}),
              }
            ),
          lastTool: toolName,
        };

      case "confirm_pending_registration":
      case "create_payment_order":
        return {
          activeIntent:
            "PAYMENT" as AgentIntent,
          goal:
            this.createGoal(
              "PAYMENT",
              status,
              "Complete payment for the selected tournament registration.",
              {
                lastObservation: observation,
                ...(needsClarification
                  ? { pendingAction: "CLARIFY_PAYMENT" }
                  : {}),
              }
            ),
          lastTool: toolName,
        };

      case "get_my_registrations":
        return {
          activeIntent:
            "REGISTRATION_STATUS" as AgentIntent,
          goal:
            this.createGoal(
              "CHECK_REGISTRATIONS",
              status,
              "Check the player's tournament registrations.",
              {
                lastObservation: observation,
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
              status,
              "Cancel the selected tournament registration.",
              {
                lastObservation: observation,
              }
            ),
          lastTool: toolName,
        };

      case "get_my_profile":
        return {
          activeIntent:
            "PROFILE" as AgentIntent,
          goal:
            this.createGoal(
              "VIEW_PROFILE",
              status,
              "Retrieve the player's Sportora profile.",
              {
                lastObservation: observation,
              }
            ),
          lastTool: toolName,
        };

      case "get_match_details":
      case "get_tournament_matches":
        return {
          activeIntent:
            "MATCH" as AgentIntent,
          goal:
            this.createGoal(
              "CHECK_MATCH",
              status,
              "Retrieve match information for the player.",
              {
                lastObservation: observation,
              }
            ),
          lastTool: toolName,
        };

      default:
        return {
          goal: {
            type: "VIEW_PROFILE" as AgentGoalType,
            status,
            description:
              "Complete the player's requested operation.",
            lastObservation:
              observation,
          },
          lastTool: toolName,
        };
    }
  }

  private static deriveState(
    toolName: string,
    result: AgentToolResult
  ) {
    switch (toolName) {

      case "search_tournaments":
        return {
          activeIntent:
            "TOURNAMENT_DISCOVERY" as AgentIntent,
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
                  "COMPLETED",
                  "Register the player for the selected tournament.",
                  {
                    completedSteps: [
                      "SELECT_TOURNAMENT",
                      "REGISTRATION",
                    ],
                    lastObservation:
                      result.message ??
                      "Tournament registration completed.",
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
            "PAYMENT" as AgentIntent,
          activeEntity:
            tournamentId
              ? {
                  type: "TOURNAMENT" as const,
                  id: String(tournamentId),
                }
              : null,
          goal:
            this.createGoal(
              "PAYMENT",
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

      case "get_my_profile":
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
                  result.message ??
                  "Profile retrieved.",
              }
            ),
          lastTool: toolName,
        };

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
