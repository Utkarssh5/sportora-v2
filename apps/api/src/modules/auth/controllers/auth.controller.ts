import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { registerSchema } from "../schemas/register.schema.js";
import { loginSchema } from "../schemas/login.schema.js";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      // Set Refresh Token as HTTP-Only Cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: result.user._id,
            fullName: result.user.fullName,
            email: result.user.email,
            role: result.user.role,
            mustChangePassword: result.user.mustChangePassword,
          },
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token missing",
        });
      }

      const result = await authService.refresh(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Access token refreshed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }
}

export const authController = new AuthController();