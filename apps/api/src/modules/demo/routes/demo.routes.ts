import { Router } from "express";

import {
  authMiddleware,
} from "../../../middleware/auth.middleware.js";

import {
  createDemoTournament,
  generateDemoFixtures,
  getDemoTournament,
  resetDemoTournament,
  simulateNextMatch,
  simulateAllMatches,
} from "../controllers/demo.controller.js";

const router = Router();

/*
 * Demo Lab is protected by authentication.
 *
 * It is intended for development/QA only.
 */

router.post(
  "/tournament/create",
  authMiddleware,
  createDemoTournament
);

router.post(
  "/tournament/:tournamentId/generate-fixtures",
  authMiddleware,
  generateDemoFixtures
);

router.post(
  "/tournament/:tournamentId/simulate-next",
  authMiddleware,
  simulateNextMatch
);

router.post(
  "/tournament/:tournamentId/simulate-all",
  authMiddleware,
  simulateAllMatches
);

router.get(
  "/tournament/:tournamentId",
  authMiddleware,
  getDemoTournament
);

router.delete(
  "/tournament/reset",
  authMiddleware,
  resetDemoTournament
);

export default router;
