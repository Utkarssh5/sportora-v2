import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authMiddleware, authorize } from "../../../middleware/auth.middleware.js";


const router = Router();

router.post(
  "/admins",
  authMiddleware,
  authorize("ADMIN"),
  (req, res, next) => adminController.createAdmin(req, res, next),
);

router.patch(
  "/me/password",
  authMiddleware,
  (req, res, next) => adminController.changePassword(req, res, next),
);

export default router;
