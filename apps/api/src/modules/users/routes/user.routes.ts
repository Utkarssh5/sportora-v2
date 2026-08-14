import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged in user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/me",
  authMiddleware,
  (req, res) => userController.getMe(req, res)
);

export default router;
