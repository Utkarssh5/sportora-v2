import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../../middleware/auth.middleware.js";
import { venueVerificationController } from "../controllers/venueVerification.controller.js";

const router = Router();

router.get(
  "/venue-verification/my",
  authMiddleware,
  authorize("ORGANIZER"),
  (req, res, next) =>
    venueVerificationController.myRequests(req, res, next)
);

router.post(
  "/venue-verification/tournament/:tournamentId/submit",
  authMiddleware,
  authorize("ORGANIZER"),
  (req, res, next) =>
    venueVerificationController.submit(req, res, next)
);

router.get(
  "/venue-verification/tournament/:tournamentId",
  authMiddleware,
  authorize("ADMIN", "ORGANIZER"),
  (req, res, next) =>
    venueVerificationController.byTournament(req, res, next)
);

router.get(
  "/venue-verification/all",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    venueVerificationController.all(req, res, next)
);

router.patch(
  "/venue-verification/:id/approve",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    venueVerificationController.approve(req, res, next)
);

router.patch(
  "/venue-verification/:id/more-proof",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    venueVerificationController.moreProof(req, res, next)
);

router.patch(
  "/venue-verification/:id/reject",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    venueVerificationController.reject(req, res, next)
);

export default router;
