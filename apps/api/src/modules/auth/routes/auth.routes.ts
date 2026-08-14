import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new Sportora user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Utkarsh Tripathi
 *               email:
 *                 type: string
 *                 example: utkarsh@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               role:
 *                 type: string
 *                 enum:
 *                   - PLAYER
 *                   - ORGANIZER
 *                   - ADMIN
 *                   - REFEREE
 *                   - UMPIRE
 *                   - VOLUNTEER
 *                   - SPONSOR
 *                 example: PLAYER
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate a user and return JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: utkarsh@gmail.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh Access Token
 *     description: Generate a new access token using the refresh token stored in the HTTP-only cookie.
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Refresh token missing or invalid
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Clears refresh token cookie.
 *     responses:
 *       200:
 *         description: Logout successful
 */

router.post("/register", (req, res, next) =>
  authController.register(req, res, next)
);

router.post("/login", (req, res, next) =>
  authController.login(req, res, next)
);

router.post("/refresh", (req, res, next) =>
  authController.refresh(req, res, next)
);

router.post("/logout", (req, res) =>
  authController.logout(req, res)
);

export const authRoutes = router;