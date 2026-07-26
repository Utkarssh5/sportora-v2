import { Router } from 'express';
import { handleAIAssistant } from '../controllers/ai.controller.js';

const router = Router();
router.post('/chat', handleAIAssistant);

export default router;
