import type { Request, Response } from "express";

import { tournamentRegistrationService } from "../services/tournamentRegistration.service.js";

class TournamentRegistrationController {
  async register(req: Request, res: Response) {
    try {
      const user = req.user as { id: string };

      const registration =
        await tournamentRegistrationService.register(
          req.params.tournamentId as string,
          user.id
        );

      return res.status(201).json({
        success: true,
        message: "Successfully registered for tournament",
        data: registration,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getParticipants(req: Request, res: Response) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const participants =
        await tournamentRegistrationService.getParticipants(
          req.params.tournamentId as string,
          user
        );

      return res.status(200).json({
        success: true,
        count: participants.length,
        data: participants,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found"
          ? 404
          : error.message.includes("permission")
            ? 403
            : 400;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyRegistrations(req: Request, res: Response) {
    try {
      const user = req.user as { id: string };

      const registrations =
        await tournamentRegistrationService.getMyRegistrations(
          user.id
        );

      return res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async verifyRegistration(req: Request, res: Response) {
    try {
      const { registrationId } = req.params;

      if (
        typeof registrationId !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration ID",
        });
      }

      const result =
        await tournamentRegistrationService.verifyRegistration(
          registrationId
        );

      return res.status(result.valid ? 200 : 404).json({
        success: result.valid,
        ...result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Unable to verify registration",
      });
    }
  }


  async cancel(req: Request, res: Response) {
    try {
      const user = req.user as { id: string };

      const registration =
        await tournamentRegistrationService.cancel(
          req.params.registrationId as string,
          user.id
        );

      return res.status(200).json({
        success: true,
        message: "Tournament registration cancelled",
        data: registration,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const tournamentRegistrationController =
  new TournamentRegistrationController();
