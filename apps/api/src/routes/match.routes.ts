import { Router } from 'express';
import { createMatch, updateScore, getMatchDetails } from '../controllers/match.controller.js';

const router = Router();

router.post('/create', createMatch);
router.patch('/:matchId/score', updateScore);
router.get('/:matchId', getMatchDetails);

export default router;
