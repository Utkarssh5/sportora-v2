import { Router } from "express";

import { authMiddleware, authorize } from "../../../middleware/auth.middleware.js";

import { organizerVerificationController } from "../controllers/organizerVerification.controller.js";

const router = Router();

router.post(
  "/verification/request",
  authMiddleware,
  authorize("ORGANIZER"),
  (req, res, next) =>
    organizerVerificationController.request(req, res, next)
);

router.get(
  "/verification/my-request",
  authMiddleware,
  authorize("ORGANIZER"),
  (req, res, next) =>
    organizerVerificationController.myRequest(req, res, next)
);

router.get(
  "/verification/all",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    organizerVerificationController.getAll(req, res, next)
);

router.patch(
  "/verification/:id/approve",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    organizerVerificationController.approve(req, res, next)
);

router.patch(
  "/verification/:id/reject",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) =>
    organizerVerificationController.reject(req, res, next)
);

export default router;