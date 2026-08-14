import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  tournamentRegistrationController,
} from "../controllers/tournamentRegistration.controller.js";

const router = Router();

router.post(
  "/:tournamentId/register",
  authMiddleware,
  tournamentRegistrationController.register
);

router.get(
  "/:tournamentId/participants",
  authMiddleware,
  tournamentRegistrationController.getParticipants
);

router.get(
  "/my",
  authMiddleware,
  tournamentRegistrationController.getMyRegistrations
);

router.patch(
  "/:registrationId/cancel",
  authMiddleware,
  tournamentRegistrationController.cancel
);

export default router;
