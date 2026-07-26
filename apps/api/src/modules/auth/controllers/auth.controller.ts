import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { registerSchema } from "../schemas/register.schema.js";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      const user = await authService.register(data);

      const { password, ...safeUser } = user.toObject();

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Registration failed",
      });
    }
  }
}

export const authController = new AuthController();