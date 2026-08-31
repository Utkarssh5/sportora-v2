import { gemini, GEMINI_MODEL } from "./gemini.service.js";

import {
  agentToolDeclarations,
  agentToolHandlers,
  playerToolDeclarations,
  playerToolHandlers,
} from "../tool-registry.js";

import { SPORTORA_AGENT_SYSTEM_PROMPT } from "../prompts/agent.prompt.js";
import { SPORTORA_USER_AGENT_SYSTEM_PROMPT } from "../prompts/user-agent.prompt.js";

import { aiRepository } from "../repositories/ai.repository.js";
import { agentStateService } from "./agent-state.service.js";
import { agentWorkflowService } from "./agent-workflow.service.js";
import { referenceResolverService } from "./reference-resolver.service.js";
import { agentPlannerService } from "./agent-planner.service.js";
import { agentVerificationService } from "./agent-verification.service.js";
import { agentPlanExecutorService } from "./agent-plan-executor.service.js";
import { DateResolverService } from "./date-resolver.service.js";

import type {
  AgentContext,
  AgentGoal,
  AgentPlan,
  AgentToolResult,
} from "../types.js";

import type {
  AgentStepContractContext,
} from "./agent-step-contract.service.js";


type AgentContent = {
  role: "user" | "model";
  parts: any[];
};

function buildDateRuntimeContext(
  prompt: string,
  referenceDate = new Date()
): string {
  const normalized = prompt
    .trim()
    .toLowerCase();

  const expressions = [
    "this weekend",
    "next weekend",
    "this week",
    "next week",
    "this month",
    "next month",
    "tomorrow",
    "yesterday",
    "today",
    "aaj",
    "kal",
  ];

  const expression =
    expressions.find((candidate) =>
      normalized.includes(candidate)
    );

  if (!expression) {
    return "";
  }

  const resolved =
    DateResolverService.resolve(
      expression,
      referenceDate
    );

  if (resolved.needsClarification) {
    return [
      "DETERMINISTIC DATE CONTEXT",
      `Requested date expression: ${expression}`,
      "Date could not be safely resolved.",
      `Clarification: ${resolved.clarificationMessage ?? ""}`,
    ].join("\n");
  }

  return [
    "DETERMINISTIC DATE CONTEXT",
    "Sportora's deterministic date resolver produced the following authoritative range.",
    `Requested expression: ${expression}`,
    `startDateFrom: ${resolved.startDateFrom ?? ""}`,
    `startDateTo: ${resolved.startDateTo ?? ""}`,
    "Use these exact values for tournament discovery.",
    "Do not recalculate, reinterpret, broaden, or replace this date range.",
  ].join("\n");
}


function buildRuntimeContext(
  agentState: unknown,
  pendingRegistration: unknown
): string {
  if (!agentState && !pendingRegistration) {
    return "";
  }

  const pending =
    pendingRegistration as {
      tournamentId?: string | null;
      action?: string | null;
      confirmedAt?: Date | string | null;
    } | null;

  let workflowStatus = "NONE";

  if (
    pending?.action === "PAYMENT_REQUIRED" &&
    !pending.confirmedAt
  ) {
    workflowStatus =
      "REGISTRATION_CONFIRMATION_REQUIRED";
  } else if (
    pending?.action === "PAYMENT_REQUIRED" &&
    pending.confirmedAt
  ) {
    workflowStatus =
      "REGISTRATION_CONFIRMED_PAYMENT_READY";
  }

  return [
    "SPORTORA RUNTIME CONTEXT",
    "",
    "The following is internal conversation state.",
    "Use it to resolve references and maintain continuity.",
    "Do not expose this internal state to the user.",
    "",
    `Derived workflow status: ${workflowStatus}`,
    "",
    JSON.stringify(
      {
        agentState,
        pendingRegistration,
      },
      null,
      2
    ),
  ].join("\n");
}


function buildStepRuntimeContext(
  context: AgentContext,
  agentState: any,
  pendingRegistration: any
): AgentStepContractContext {
  const information: Record<string, unknown> = {};
  const confirmations: Record<string, boolean> = {};

  const goal = agentState?.goal;

  if (goal?.constraints) {
    Object.assign(information, goal.constraints);
  }

  if (goal?.requiredInformation) {
    for (const field of goal.requiredInformation) {
      if (goal.constraints?.[field] !== undefined) {
        information[field] = goal.constraints[field];
      }
    }
  }

  if (agentState?.activeEntity?.id) {
    information.entityId =
      agentState.activeEntity.id;
  }

  if (agentState?.activeEntity?.type) {
    information.entityType =
      agentState.activeEntity.type;
  }

  if (pendingRegistration?.tournamentId) {
    information.tournamentId =
      pendingRegistration.tournamentId;
  }

  if (
    pendingRegistration?.confirmedAt
  ) {
    confirmations.payment = true;
  }

  return {
    context,
    information,
    confirmations,
  };
}

export class AgentService {

  public static async chat(
    prompt: string,
    context: AgentContext,
    mode: "user" | "default" = "user"
  ) {

    if (!context.conversationId) {
      throw new Error(
        "Conversation ID is required."
      );
    }


    const conversationId =
      context.conversationId;

    /*
     * Timestamp the start of this user turn.
     * Pending confirmations must come from a previous turn.
     */
    context.requestStartedAt = new Date();


    /*
     * Make sure this conversation belongs
     * to the authenticated user.
     */

      const conversation =
      await aiRepository.getConversation(
        conversationId,
        context.user.id
      );


    if (!conversation) {

        await aiRepository.createConversation(
          conversationId,
          context.user.id
        );
    }


    /*
     * Persist the current user request as fast agent context.
     */

    await agentStateService.recordUserMessage(
      prompt,
      context
    );

    /*
     * Load previous user/model messages.
     */

    const previousMessages =
      await aiRepository.getMessages(
        conversationId,
        20
      );


    let lastToolData: unknown = undefined;

    const contents: AgentContent[] =
      previousMessages.map(
        (message) => ({
          role:
            message.role === "user"
              ? "user"
              : "model",

          parts: [
            {
              text: message.content,
            },
          ],
        })
      );


    /*
     * Save current user message.
     */

    await aiRepository.saveMessage(
      conversationId,
      "user",
      prompt
    );


    contents.push({
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    });


    const systemPrompt =
      mode === "user"
        ? SPORTORA_USER_AGENT_SYSTEM_PROMPT
        : SPORTORA_AGENT_SYSTEM_PROMPT;

    const toolDeclarations =
      mode === "user"
        ? playerToolDeclarations
        : agentToolDeclarations;

    const toolHandlers =
      mode === "user"
        ? playerToolHandlers
        : agentToolHandlers;


    let currentAgentState =
      await aiRepository.getAgentState(
        conversationId
      );

    let currentPendingRegistration =
      await aiRepository.getPendingRegistration(
        conversationId
      );

    for (
      let iteration = 0;
      iteration < 5;
      iteration++
    ) {

      /*
       * Reuse the latest workflow state for this Gemini iteration.
       *
       * After a tool executes, the evaluator refreshes these values
       * so the next iteration observes the latest backend state
       * without performing a duplicate read.
       */

      const runtimeContext =
        buildRuntimeContext(
          currentAgentState,
          currentPendingRegistration
        );

      const dateRuntimeContext =
        buildDateRuntimeContext(prompt);

      const effectiveSystemPrompt =
        [
          systemPrompt,
          runtimeContext,
          dateRuntimeContext,
        ]
          .filter(Boolean)
          .join("\n\n");

        /*
         * Create a dynamic execution plan when:
         *
         * 1. the workflow has a goal but no persisted plan, or
         * 2. the previous tool failed and the agent must recover.
         *
         * A failed workflow is deliberately replanned from the
         * latest persisted observation instead of blindly retrying
         * the failed step.
         */
        if (
          currentAgentState?.goal &&
          (
            !currentAgentState.goal.plan ||
            currentAgentState.goal.status === "FAILED"
          )
        ) {
          const goalForPlanner =
            JSON.parse(
              JSON.stringify(
                currentAgentState.goal
              )
            ) as NonNullable<
              typeof currentAgentState.goal
            >;

          const plannerGoal = {
            ...goalForPlanner,
            ...(currentAgentState?.lastTournamentSearch
              ? {
                  lastTournamentSearch:
                    currentAgentState.lastTournamentSearch,
                }
              : {}),
          };

          const dynamicPlan =
            await agentPlannerService.createDynamicPlan(
              plannerGoal as any,
              context
            );

          await aiRepository.updateAgentState(
            conversationId,
            {
              goal: {
                type: goalForPlanner.type!,
                status: goalForPlanner.status,
                ...(goalForPlanner.description != null
                  ? {
                      description:
                        goalForPlanner.description,
                    }
                  : {}),
                ...(goalForPlanner.constraints != null
                  ? {
                      constraints:
                        goalForPlanner.constraints,
                    }
                  : {}),
                ...(goalForPlanner.requiredInformation != null
                  ? {
                      requiredInformation:
                        goalForPlanner.requiredInformation,
                    }
                  : {}),
                ...(goalForPlanner.completedSteps != null
                  ? {
                      completedSteps:
                        goalForPlanner.completedSteps,
                    }
                  : {}),
                ...(goalForPlanner.pendingAction != null
                  ? {
                      pendingAction:
                        goalForPlanner.pendingAction,
                    }
                  : {}),
                ...(goalForPlanner.lastObservation != null
                  ? {
                      lastObservation:
                        goalForPlanner.lastObservation,
                    }
                  : {}),
                plan: dynamicPlan,
              },
            }
          );

          currentAgentState =
            await aiRepository.getAgentState(
              conversationId
            );
        }

        /*
         * Evaluate the refreshed workflow state before asking
         * Gemini for the next action.
         *
         * This keeps planning and workflow state synchronized:
         * dynamic plans are persisted first, then the deterministic
         * workflow evaluator observes the latest state.
         */
        agentWorkflowService.evaluate(
          currentAgentState
        );


      const response =
        await gemini.models.generateContent({
          model: GEMINI_MODEL,

          contents,

          config: {
            systemInstruction:
              effectiveSystemPrompt,

            tools: [
              {
                functionDeclarations:
                  toolDeclarations,
              },
            ],
          },
        });


      const functionCalls =
        response.functionCalls;


      /*
       * Final Gemini response.
       */

      if (
        !functionCalls ||
        functionCalls.length === 0
      ) {

        const finalMessage =
          response.text ||
          "I was unable to generate a response.";


        await aiRepository.saveMessage(
          conversationId,
          "model",
          finalMessage
        );


        return {
          success: true,
          message: finalMessage,
          conversationId,
          data: lastToolData,
        };
      }


      /*
       * Gemini requested one or more tools.
       */

      const modelParts =
        response.candidates?.[0]
          ?.content?.parts ?? [];


      contents.push({
        role: "model",
        parts: modelParts,
      });


      const functionResponseParts: any[] =
        [];


      for (
        const functionCall of functionCalls
      ) {

        const toolName =
          functionCall.name;


        if (!toolName) {
          continue;
        }


        /*
         * Evaluate the workflow first.
         *
         * The workflow evaluator remains the authoritative
         * deterministic gate for the current backend state.
         */
        const currentWorkflowEvaluation =
          agentWorkflowService.evaluate(
            currentAgentState
          );

        /*
         * Enforce the persisted dynamic plan as an additional
         * execution constraint.
         *
         * Gemini may propose an action, but it cannot bypass
         * the persisted goal-oriented plan.
         */
        const persistedPlan =
          currentAgentState?.goal?.plan;

        let planBlockedMessage:
          string | null = null;

        if (persistedPlan) {
          const normalizedPlan: AgentPlan = {
            version: persistedPlan.version,
            steps: persistedPlan.steps.map(
              (step) => ({
                id: step.id,
                action: step.action,
                description: step.description,
                status: step.status,
                dependsOn: Array.isArray(step.dependsOn)
                  ? [...step.dependsOn]
                  : [],
                ...(step.toolName != null
                  ? {
                      toolName: step.toolName,
                    }
                  : {}),
                ...((step as unknown as AgentPlan["steps"][number]).requiredInformation != null
                  ? {
                      requiredInformation:
                        [...((step as unknown as AgentPlan["steps"][number]).requiredInformation ?? [])],
                    }
                  : {}),

                ...((step as unknown as AgentPlan["steps"][number]).constraints != null
                  ? {
                      constraints:
                        { ...(step as unknown as AgentPlan["steps"][number]).constraints },
                    }
                  : {}),

                ...((step as unknown as AgentPlan["steps"][number]).successCriteria != null
                  ? {
                      successCriteria:
                        [...((step as unknown as AgentPlan["steps"][number]).successCriteria ?? [])],
                    }
                  : {}),

                ...((step as unknown as AgentPlan["steps"][number]).verificationCriteria != null
                  ? {
                      verificationCriteria:
                        [...((step as unknown as AgentPlan["steps"][number]).verificationCriteria ?? [])],
                    }
                  : {}),

                ...((step as unknown as AgentPlan["steps"][number]).failureStrategy != null
                  ? {
                      failureStrategy:
                        (step as unknown as AgentPlan["steps"][number]).failureStrategy,
                    }
                  : {}),

                ...((step as unknown as AgentPlan["steps"][number]).requiresUserInput != null
                  ? {
                      requiresUserInput:
                        (step as unknown as AgentPlan["steps"][number]).requiresUserInput,
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
            ...(persistedPlan.currentStepId != null
              ? {
                  currentStepId:
                    persistedPlan.currentStepId,
                }
              : {}),
          };

          const executableStep =
            agentPlanExecutorService.getNextExecutableStep(
              normalizedPlan,
              buildStepRuntimeContext(
                context,
                currentAgentState,
                currentPendingRegistration
              )
            );

          /*
           * A search plan may contain a reasoning/checkpoint step
           * after SEARCH_TOURNAMENTS. A new user message can
           * legitimately turn the discovered candidates into
           * an explicit action, e.g. "register in the second one".
           *
           * Do not let the stale discovery checkpoint block that
           * conversational follow-up. Registration still passes
           * through the normal registration/confirmation/payment
           * workflow gates below.
           */
          const isTournamentRegistrationFollowUp =
            toolName === "register_for_tournament" &&
            currentAgentState?.activeIntent ===
              "TOURNAMENT_DISCOVERY" &&
            Array.isArray(
              currentAgentState?.candidateTournaments
            ) &&
            currentAgentState.candidateTournaments.length > 0;

          /*
           * Once registration is waiting for explicit payment
           * confirmation, the user's confirmation must be able
           * to execute confirm_pending_registration even if an
           * older dynamic-plan checkpoint is still persisted.
           */
          const isRegistrationConfirmationFollowUp =
            toolName ===
              "confirm_pending_registration" &&
            currentAgentState?.goal?.status ===
              "WAITING_CONFIRMATION";

          if (
            !isTournamentRegistrationFollowUp &&
            !isRegistrationConfirmationFollowUp &&
            executableStep &&
            executableStep.toolName !== toolName
          ) {
            planBlockedMessage =
              `The current agent plan requires ${executableStep.toolName} before ${toolName}.`;
          }

          /*
           * A plan checkpoint without an executable tool means
           * the agent must observe/reason before another tool.
           */
          if (
            !isTournamentRegistrationFollowUp &&
            !isRegistrationConfirmationFollowUp &&
            !executableStep &&
            normalizedPlan.steps.some(
              (step) =>
                step.status === "PENDING" &&
                !step.toolName
            )
          ) {
            planBlockedMessage =
              "The current agent plan requires an observation or state transition before another tool can execute.";
          }
        }

        /*
         * Enforce the workflow evaluator before executing
         * any tool requested by the model.
         *
         * The evaluator was already computed above so the
         * persisted-plan gate and workflow gate share the
         * same evaluation for this tool request.
         */
        /*
         * The workflow gate is authoritative for sensitive
         * transactional stages such as confirmation/payment.
         *
         * Informational requests such as tournament discovery,
         * tournament details, profile and match queries must not
         * be blocked by a stale checkpoint from an older workflow.
         */
        const activeGoalType =
          currentAgentState?.goal?.type;

        const activeGoalStatus =
          currentAgentState?.goal?.status;

        const transactionalStage =
          activeGoalType === "REGISTER_TOURNAMENT" ||
          activeGoalType === "PAYMENT" ||
          activeGoalStatus === "WAITING_CONFIRMATION" ||
          activeGoalStatus === "PAYMENT_READY" ||
          activeGoalStatus === "PAYMENT_PENDING" ||
          currentAgentState?.activeIntent === "PAYMENT" ||
          currentAgentState?.activeIntent === "TOURNAMENT_REGISTRATION" ||
          String(currentAgentState?.activeIntent) === "PAYMENT_READY";

        /*
         * Always evaluate the workflow gate so the evaluator remains
         * observable and authoritative. For normal informational
         * requests, an old/stale transactional workflow must not
         * prevent the appropriate read-only tool from executing.
         */
        const evaluatorAllowsTool =
          agentWorkflowService.isToolAllowed(
            currentWorkflowEvaluation,
            toolName
          );

        const workflowAllowsTool =
          transactionalStage
            ? evaluatorAllowsTool
            : true;

        if (!workflowAllowsTool) {
          const allowedTool =
            currentWorkflowEvaluation.allowedNextTool;

          const blockedMessage =
            allowedTool
              ? `The current workflow only permits ${allowedTool} at this stage.`
              : "This action is not permitted at the current workflow stage.";

          await aiRepository.saveMessage(
            conversationId,
            "model",
            blockedMessage
          );

          return {
            success: true,
            message: blockedMessage,
            conversationId,
          };
        }

        if (planBlockedMessage) {
          await aiRepository.saveMessage(
            conversationId,
            "model",
            planBlockedMessage
          );

          return {
            success: true,
            message: planBlockedMessage,
            conversationId,
          };
        }


        const handler =
          toolHandlers[toolName];


        let result: AgentToolResult;
        let toolArgs = functionCall.args ?? {};


        if (!handler) {

          result = {
            success: false,
            message:
              `Unknown agent tool: ${toolName}`,
          };

        } else {

          try {

            /*
             * Resolve conversational tournament references
             * before executing tournament-aware player tools.
             *
             * Examples:
             *   "pehla wala"
             *   "second"
             *   "isme"
             *   "wahi tournament"
             *
             * Actual tournament IDs are preserved when they
             * already exist in the conversation state.
             */
            if (
              mode === "user" &&
              (
                toolName === "get_tournament" ||
                toolName === "register_for_tournament" ||
                toolName === "create_payment_order"
              ) &&
              typeof toolArgs === "object" &&
              toolArgs !== null &&
              typeof (toolArgs as any).tournamentId === "string"
            ) {
              const tournamentReference =
                (toolArgs as any).tournamentId.trim();

              const resolution =
                await referenceResolverService
                  .resolveTournamentReference(
                    tournamentReference,
                    context
                  );

              if (resolution.resolved && resolution.value) {
                toolArgs = {
                  ...(toolArgs as Record<string, unknown>),
                  tournamentId: resolution.value,
                };
              } else if (
                resolution.reason === "AMBIGUOUS"
              ) {
                result = {
                  success: false,
                  message:
                    "The tournament reference matches multiple tournaments. Please specify which tournament you mean.",
                };

                await agentStateService.recordToolResult(
                  toolName,
                  result,
                  context,
                  toolArgs
                );

                functionResponseParts.push({
                  functionResponse: {
                    name: toolName,
                    response: result,
                  },
                });

                continue;
              } else {
                result = {
                  success: false,
                  message:
                    "I could not identify the tournament you referred to. Please specify the tournament name.",
                };

                await agentStateService.recordToolResult(
                  toolName,
                  result,
                  context,
                  toolArgs
                );

                functionResponseParts.push({
                  functionResponse: {
                    name: toolName,
                    response: result,
                  },
                });

                continue;
              }
            }

            result =
              await handler(
                toolArgs,
                context
              );

          } catch (error: any) {

            result = {
              success: false,
              message:
                error?.message ||
                "Tool execution failed.",
            };
          }
        }


        await agentStateService.recordToolResult(
          toolName,
          result,
          context,
          toolArgs
        );

        /*
         * Preserve structured data from the latest successful
         * tool so the API can expose it alongside Gemini's
         * natural-language response.
         */
        if (result.success && result.data !== undefined) {
          lastToolData = result.data;
        }

        /*
         * Evaluate the workflow after every tool observation.
         *
         * The evaluator is deterministic and acts as a runtime
         * safety/workflow gate around the LLM tool loop.
         */
        currentAgentState =
          await aiRepository.getAgentState(
            conversationId
          );

        currentPendingRegistration =
          await aiRepository.getPendingRegistration(
            conversationId
          );

        const workflowEvaluation =
          agentWorkflowService.evaluate(
            currentAgentState
          );

        /*
         * Verify the observed backend result before allowing
         * a goal to be considered completed.
         *
         * The verifier is deterministic and must never rely
         * on the LLM claiming that an operation succeeded.
         */
        const observedGoal =
          currentAgentState?.goal;

        if (
          observedGoal &&
          observedGoal.type &&
          result.success
        ) {
          const verification =
            await agentVerificationService.verifyGoal(
              observedGoal as AgentGoal,
              toolName,
              result,
              context
            );

          if (
            verification.verified
          ) {
            await aiRepository.updateAgentState(
              conversationId,
              {
                goal: {
                  type: observedGoal.type,
                  status: "COMPLETED",
                  ...(observedGoal.description != null
                    ? {
                        description:
                          observedGoal.description,
                      }
                    : {}),
                  ...(observedGoal.constraints != null
                    ? {
                        constraints:
                          observedGoal.constraints,
                      }
                    : {}),
                  ...(observedGoal.requiredInformation != null
                    ? {
                        requiredInformation:
                          observedGoal.requiredInformation,
                      }
                    : {}),
                  ...(observedGoal.completedSteps != null
                    ? {
                        completedSteps:
                          observedGoal.completedSteps,
                      }
                    : {}),
                  ...(observedGoal.pendingAction != null
                    ? {
                        pendingAction:
                          observedGoal.pendingAction,
                      }
                    : {}),
                  lastObservation:
                    verification.reason,
                },
              }
            );

            currentAgentState =
              await aiRepository.getAgentState(
                conversationId
              );
          }
        }

        if (
          workflowEvaluation.decision === "REPLAN" &&
          currentAgentState?.goal
        ) {
          const goalForPlanner =
            JSON.parse(
              JSON.stringify(
                currentAgentState.goal
              )
            );

          const dynamicPlan =
            await agentPlannerService.createDynamicPlan(
              goalForPlanner,
              context
            );

          await aiRepository.updateAgentState(
            conversationId,
            {
              goal: {
                ...goalForPlanner,
                plan: dynamicPlan,
              },
            }
          );

          currentAgentState =
            await aiRepository.getAgentState(
              conversationId
            );

          currentPendingRegistration =
            await aiRepository.getPendingRegistration(
              conversationId
            );

          /*
           * The new plan is persisted.
           *
           * Do not execute a recovery tool directly here.
           * The next Gemini iteration must observe the new
           * plan and request the appropriate tool.
           */
          continue;
        }

        if (
          workflowEvaluation.decision === "ASK_USER" ||
          workflowEvaluation.decision === "STOP"
        ) {
          const workflowMessage =
            result.message ||
            workflowEvaluation.reason;

          await aiRepository.saveMessage(
            conversationId,
            "model",
            workflowMessage
          );

          return {
            success: true,
            message: workflowMessage,
            conversationId,
            data: result.success ? result.data : undefined,
          };
        }

        functionResponseParts.push({
          functionResponse: {
            name: toolName,
            response: result,
          },
        });
      }


      contents.push({
        role: "user",
        parts: functionResponseParts,
      });
    }


    return {
      success: false,
      message:
        "The agent reached the maximum number of tool steps.",
      conversationId,
    };
  }
}


export const agentService = AgentService;
