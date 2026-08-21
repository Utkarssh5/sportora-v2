import { Router } from "express";

import {
  markDemoPaid,
} from "../controllers/crew-settlement.controller.js";

import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:settlementId/pay-demo",
  authMiddleware,
  authorize("ADMIN"),
  markDemoPaid
);

export default router;
