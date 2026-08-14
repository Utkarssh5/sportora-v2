import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";

import { handleAIAssistant } from "../controllers/ai.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Chat with Sportora AI Agent
 *     description: Send a prompt to the Sportora AI agent. The agent can use registered tools for tournaments, registrations, payments, matches, and crew operations.
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: Show me badminton tournaments in Jaipur
 *               conversationId:
 *                 type: string
 *                 nullable: true
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: AI agent response
 *       400:
 *         description: Prompt is missing or invalid
 *       401:
 *         description: Authentication required
 *       500:
 *         description: AI agent request failed
 */
router.post(
  "/chat",
  authMiddleware,
  handleAIAssistant
);

export default router;
