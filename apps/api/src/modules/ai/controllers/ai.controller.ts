import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { AgentService } from "../services/agent.service.js";

import type { AgentContext } from "../types.js";


export const handleAIAssistant = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      prompt,
      conversationId: requestedConversationId,
    } = req.body;


    if (
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }


    const user = req.user as {
      id: string;
      role: string;
    };


    if (!user?.id || !user?.role) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user context is missing",
      });
    }


    const conversationId =
      typeof requestedConversationId === "string" &&
      requestedConversationId.trim()
        ? requestedConversationId.trim()
        : randomUUID();


    const context: AgentContext = {
      user: {
        id: user.id,
        role: user.role,
      },
      conversationId,
    };


    const result =
      await AgentService.chat(
        prompt.trim(),
        context
      );


    return res.status(
      result.success ? 200 : 500
    ).json({
      success: result.success,
      message: result.message,
      conversationId: result.conversationId,
    });

  } catch (error: any) {

    console.error(
      "AI Agent Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "AI agent request failed",
    });
  }
};
