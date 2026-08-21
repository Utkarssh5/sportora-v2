import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { adminService } from "../services/admin.service.js";

const createAdminSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
});

export class AdminController {
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAdminSchema.parse(req.body);
      const result = await adminService.createAdmin(data);

      return res.status(201).json({
        success: true,
        message: "Admin created and welcome email sent.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = changePasswordSchema.parse(req.body);
      const userId = (req.user as any).id;

      const result = await adminService.changePassword(
        userId,
        data.currentPassword,
        data.newPassword,
      );

      return res.status(200).json({
        success: true,
        message: "Password changed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
