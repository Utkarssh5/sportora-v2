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

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


type AgentContent = {
  role: "user" | "model";
  parts: any[];
};

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

      const effectiveSystemPrompt =
        runtimeContext
          ? `${systemPrompt}\n\n${runtimeContext}`
          : systemPrompt;

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
         * Enforce the workflow evaluator before executing
         * any tool requested by the model.
         *
         * The evaluator is the runtime guardrail. When a
         * workflow restricts the next action, unrelated tools
         * must never reach their backend handlers.
         */
        const currentWorkflowEvaluation =
          agentWorkflowService.evaluate(
            currentAgentState
          );

        if (
          !agentWorkflowService.isToolAllowed(
            currentWorkflowEvaluation,
            toolName
          )
        ) {
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


        const handler =
          toolHandlers[toolName];


        let result: AgentToolResult;


        if (!handler) {

          result = {
            success: false,
            message:
              `Unknown agent tool: ${toolName}`,
          };

        } else {

          try {

            let toolArgs =
              functionCall.args ?? {};

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
                  context
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
                  context
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
          context
        );

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
