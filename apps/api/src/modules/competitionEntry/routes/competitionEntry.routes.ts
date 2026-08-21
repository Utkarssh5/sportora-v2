import { Router } from "express";

import { authMiddleware } from "../../../middleware/auth.middleware.js";
import {
  competitionEntryController,
} from "../controllers/competitionEntry.controller.js";

const router = Router();

router.get(
  "/registration/:registrationId",
  authMiddleware,
  competitionEntryController.getByRegistration.bind(
    competitionEntryController
  )
);

router.patch(
  "/registration/:registrationId/draft",
  authMiddleware,
  competitionEntryController.saveDraft.bind(
    competitionEntryController
  )
);

router.patch(
  "/:entryId/approve",
  authMiddleware,
  competitionEntryController.approve.bind(
    competitionEntryController
  )
);

router.patch(
  "/:entryId/reject",
  authMiddleware,
  competitionEntryController.reject.bind(
    competitionEntryController
  )
);

router.patch(
  "/registration/:registrationId",
  authMiddleware,
  competitionEntryController.submitDetails.bind(
    competitionEntryController
  )
);

export default router;
