import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../../middleware/auth.middleware.js";

import {
  registerCrew,
  getMyCrewProfile,
  getCrewProfilePreview,
  updateCrewProfile,
  getAvailableCrew,
  updateCrewAvailability,
} from "../controllers/crew.controller.js";

const router = Router();

router.post(
  "/register",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  registerCrew
);

router.get(
  "/me",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  getMyCrewProfile
);

router.patch(
  "/me",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  updateCrewProfile
);

router.get(
  "/:crewId/profile",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER", "ADMIN"),
  getCrewProfilePreview
);

router.get(
  "/search",
  getAvailableCrew
);

router.patch(
  "/availability",
  authMiddleware,
  authorize("PLAYER", "ORGANIZER"),
  updateCrewAvailability
);

export default router;
