import { gemini, GEMINI_MODEL } from "./gemini.service.js";

import {
  agentToolDeclarations,
  agentToolHandlers,
} from "../tool-registry.js";

import { SPORTORA_AGENT_SYSTEM_PROMPT } from "../prompts/agent.prompt.js";

import { aiRepository } from "../repositories/ai.repository.js";

import type {
  AgentContext,
  AgentToolResult,
} from "../types.js";


type AgentContent = {
  role: "user" | "model";
  parts: any[];
};


export class AgentService {

  public static async chat(
    prompt: string,
    context: AgentContext
  ) {

    if (!context.conversationId) {
      throw new Error(
        "Conversation ID is required."
      );
    }


    const conversationId =
      context.conversationId;


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


    for (
      let iteration = 0;
      iteration < 5;
      iteration++
    ) {

      const response =
        await gemini.models.generateContent({
          model: GEMINI_MODEL,

          contents,

          config: {
            systemInstruction:
              SPORTORA_AGENT_SYSTEM_PROMPT,

            tools: [
              {
                functionDeclarations:
                  agentToolDeclarations,
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


        const handler =
          agentToolHandlers[toolName];


        let result: AgentToolResult;


        if (!handler) {

          result = {
            success: false,
            message:
              `Unknown agent tool: ${toolName}`,
          };

        } else {

          try {

            result =
              await handler(
                functionCall.args ?? {},
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
