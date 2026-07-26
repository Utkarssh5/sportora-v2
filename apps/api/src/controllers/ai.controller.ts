import type { Request, Response } from 'express';
import { AgenticAssistantService } from '../ai/assistant.service.js';

export const handleAIAssistant = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const aiResponse = await AgenticAssistantService.processUserPrompt(prompt);

    res.status(200).json({
      success: true,
      message: 'AI Assistant query processed successfully',
      data: aiResponse,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
