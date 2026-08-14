import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../../middleware/auth.middleware.js";

import {
  registerCrew,
  getAvailableCrew,
  updateCrewAvailability,
} from "../controllers/crew.controller.js";

const router = Router();

router.post(
  "/register",
  authMiddleware,
  authorize("PLAYER", "CREW"),
  registerCrew
);

router.get(
  "/search",
  getAvailableCrew
);

router.patch(
  "/availability",
  authMiddleware,
  authorize("PLAYER", "CREW"),
  updateCrewAvailability
);

export default router;
