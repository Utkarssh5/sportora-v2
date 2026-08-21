import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { registerUserSchema } from "../schemas/user.schema.js";
import { groundCrewAchievementService } from "../../crewAchievements/services/ground-crew-achievement.service.js";

export class UserController {

  async register(req: Request, res: Response) {
    try {
      const data = registerUserSchema.parse(req.body);

      const user = await userService.register(data);

      const safeUser = user.toObject();
  delete safeUser.password;

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: safeUser,
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


  async searchPlayers(
    req: Request,
    res: Response
  ) {
    try {
      const currentUserId =
        (req.user as any).id;

      const query =
        typeof req.query.q === "string"
          ? req.query.q
          : "";

      if (query.trim().length < 2) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const players =
        await userService.searchPlayers(
          query,
          currentUserId
        );

      return res.status(200).json({
        success: true,
        data: players,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to search players.",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;

      const body = req.body ?? {};

      const bio =
        typeof body.bio === "string"
          ? body.bio.trim().slice(0, 250)
          : undefined;

      const city =
        typeof body.city === "string"
          ? body.city.trim().slice(0, 100)
          : undefined;

      const state =
        typeof body.state === "string"
          ? body.state.trim().slice(0, 100)
          : undefined;

      const interests =
        Array.isArray(body.interests)
          ? body.interests
              .filter(
                (item: unknown): item is string =>
                  typeof item === "string"
              )
              .map((item: string) => item.trim())
              .filter(Boolean)
              .slice(0, 10)
          : undefined;

      const achievements =
        Array.isArray(body.achievements)
          ? body.achievements
              .filter(
                (item: unknown): item is string =>
                  typeof item === "string"
              )
              .map((item: string) => item.trim())
              .filter(Boolean)
              .slice(0, 10)
          : undefined;

      const user =
        await userService.updateProfile(userId, {
          bio,
          city,
          state,
          interests,
          achievements,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const safeUser = user.toObject();
      delete safeUser.password;

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Unable to update profile",
      });
    }
  }

  async getPerformance(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;

      const performance =
        await userService.getPerformance(userId);

      return res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load performance",
      });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req.user as any).id;

      const user = await userService.getById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const safeUser = user.toObject();
      delete safeUser.password;

      const groundCrewAchievements =
        await groundCrewAchievementService.getByUserId(userId);

      return res.status(200).json({
        success: true,
        data: {
          ...safeUser,
          groundCrewAchievements,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

}

export const userController = new UserController();
