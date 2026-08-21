import type { Request, Response, NextFunction } from "express";
import { venueVerificationService } from "../services/venueVerification.service.js";
import { submitVenueProofSchema } from "../schemas/submitVenueProof.schema.js";

export class VenueVerificationController {
  async myRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await venueVerificationService.getMyRequests(
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

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const body = submitVenueProofSchema.parse(req.body);

      const result = await venueVerificationService.submitProof(
        req.params.tournamentId as string,
        (req.user as any).id,
        body
      );

      return res.json({
        success: true,
        message: "Venue proof submitted for review.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async byTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const result =
        await venueVerificationService.getByTournament(
          req.params.tournamentId as string,
          (req.user as any).id,
          (req.user as any).role
        );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Venue verification not found.",
        });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async all(_req: Request, res: Response, next: NextFunction) {
    try {
      const result =
        await venueVerificationService.getAllRequests();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result =
        await venueVerificationService.approve(
          req.params.id as string,
          (req.user as any).id,
          req.body.remarks
        );

      return res.json({
        success: true,
        message: "Venue verification approved.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async moreProof(req: Request, res: Response, next: NextFunction) {
    try {
      const deadline = req.body.proofDeadline
        ? new Date(req.body.proofDeadline)
        : undefined;

      const result =
        await venueVerificationService.requestMoreProof(
          req.params.id as string,
          (req.user as any).id,
          req.body.remarks || "Additional venue proof required.",
          deadline
        );

      return res.json({
        success: true,
        message: "Additional venue proof requested.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result =
        await venueVerificationService.reject(
          req.params.id as string,
          (req.user as any).id,
          req.body.remarks
        );

      return res.json({
        success: true,
        message: "Venue verification rejected.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const venueVerificationController =
  new VenueVerificationController();
