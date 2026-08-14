import { Router } from "express";
import { generateFixtures } from "../controllers/fixture.controller.js";
import {
  authMiddleware,
  authorize,
} from "../../../middleware/auth.middleware.js";

import {
  createMatch,
  updateScore,
  getMatchDetails,
  getTournamentMatches,
} from "../controllers/match.controller.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  createMatch
);

router.post(
  "/tournament/:tournamentId/generate-fixtures",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  generateFixtures
);

router.patch(
  "/:matchId/score",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  updateScore
);

router.get(
  "/tournament/:tournamentId",
  authMiddleware,
  getTournamentMatches
);

router.get(
  "/:matchId",
  getMatchDetails
);

export default router;
