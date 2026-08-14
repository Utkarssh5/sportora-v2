import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { registerUserSchema } from "../schemas/user.schema.js";

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


  async getMe(req: Request, res: Response) {

    return res.status(200).json({
      id: (req.user as any).id,
      email: (req.user as any).email,
      role: (req.user as any).role,
    });

  }

}

export const userController = new UserController();
