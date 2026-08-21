import type { Request, Response } from "express";

import {
  competitionEntryService,
} from "../services/competitionEntry.service.js";

export class CompetitionEntryController {
  async getByRegistration(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
      };

      const registrationId =
        req.params.registrationId as string;

      const entry =
        await competitionEntryService.getByRegistrationId(
          registrationId
        );

      if (!entry) {
        return res.status(404).json({
          success: false,
          message:
            "Competition entry not found.",
        });
      }

      if (
        entry.captainId.toString() !== user.id
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this participation entry.",
        });
      }

      return res.status(200).json({
        success: true,
        data: entry,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to fetch competition entry.",
      });
    }
  }

  async saveDraft(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
      };

      const registrationId =
        req.params.registrationId as string;

      const {
        displayName,
        participants,
        teamSheetUrl,
      } = req.body;

      if (!Array.isArray(participants)) {
        return res.status(400).json({
          success: false,
          message:
            "participants must be an array.",
        });
      }

      const entry =
        await competitionEntryService.saveDraft(
          registrationId,
          user.id,
          {
            displayName,
            participants,
            teamSheetUrl,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Participation details saved as draft.",
        data: entry,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to save participation details.",
      });
    }
  }

  async approve(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const entryId =
        req.params.entryId as string;

      const entry =
        await competitionEntryService.approveEntry(
          entryId,
          user
        );

      return res.status(200).json({
        success: true,
        message:
          "Competition entry approved successfully.",
        data: entry,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to approve competition entry.",
      });
    }
  }

  async reject(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const entryId =
        req.params.entryId as string;

      const rejectionReason =
        req.body?.rejectionReason;

      const entry =
        await competitionEntryService.rejectEntry(
          entryId,
          user,
          rejectionReason
        );

      return res.status(200).json({
        success: true,
        message:
          "Competition entry rejected.",
        data: entry,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to reject competition entry.",
      });
    }
  }

  async submitDetails(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
      };

      const registrationId =
        req.params.registrationId as string;

      const {
        displayName,
        participants,
        teamSheetUrl,
      } = req.body;

      if (!Array.isArray(participants)) {
        return res.status(400).json({
          success: false,
          message:
            "participants must be an array.",
        });
      }

      const entry =
        await competitionEntryService.submitDetails(
          registrationId,
          user.id,
          {
            displayName,
            participants,
            teamSheetUrl,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Participation details submitted successfully.",
        data: entry,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to submit participation details.",
      });
    }
  }
}

export const competitionEntryController =
  new CompetitionEntryController();
