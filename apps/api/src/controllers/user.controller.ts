import { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { registerSchema } from "../validators/user.validator.js";

export class UserController {
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const data = registerSchema.parse(req.body);

      // Register user
      const user = await userService.register(data);

      // Remove password before sending response
      const { password, ...safeUser } = user.toObject();

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
}

export const userController = new UserController();