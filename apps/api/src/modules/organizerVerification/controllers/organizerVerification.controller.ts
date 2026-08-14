import type { Request, Response, NextFunction } from "express";

import { organizerVerificationService } from "../services/organizerVerification.service.js";
import { requestVerificationSchema } from "../schemas/requestVerification.schema.js";

export class OrganizerVerificationController {
  async request(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const body = requestVerificationSchema.parse(req.body);

      const result =
        await organizerVerificationService.requestVerification(
          (req.user as any).id,
          body
        );

      return res.status(201).json({
        success: true,
        message: "Verification request submitted",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async myRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await organizerVerificationService.myRequest(
          (req.user as any).id
        );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await organizerVerificationService.getAllRequests();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approve(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await organizerVerificationService.approve(
          req.params.id as string,
          (req.user as any).id
        );

      return res.json({
        success: true,
        message: "Organizer approved",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await organizerVerificationService.reject(
          req.params.id as string,
          (req.user as any).id,
          req.body.remarks
        );

      return res.json({
        success: true,
        message: "Organizer rejected",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const organizerVerificationController =
  new OrganizerVerificationController();
  
