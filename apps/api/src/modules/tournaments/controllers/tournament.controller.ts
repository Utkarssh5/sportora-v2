import type { Request, Response } from "express";

import { tournamentService } from "../services/tournament.service.js";
import {
  tournamentCrewAssignmentService,
} from "../services/tournament-crew-assignment.service.js";
import {
  tournamentCrewRequirementService,
} from "../services/tournament-crew-requirement.service.js";
import {
  tournamentCrewInvitationService,
} from "../services/tournament-crew-invitation.service.js";
import {
  tournamentCrewWorkOpportunityService,
} from "../services/tournament-crew-work-opportunity.service.js";
import {
  tournamentCrewWorkApplicationService,
} from "../services/tournament-crew-work-application.service.js";


class TournamentController {


  async create(
    req: Request,
    res: Response
  ) {

    try {

      const user = req.user as {
        id: string;
        role: string;
      };


      const result =
        await tournamentService.createTournament(
          req.body,
          user
        );


      return res.status(201).json({
        success: true,
        message:
          "Tournament proposal submitted for Admin review.",
        data: result,
      });


    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }



  async getAll(
    req: Request,
    res: Response
  ) {

    try {

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;


      const filter: Record<string, unknown> = {};


      if (req.query.search) {
        filter.title = {
          $regex: req.query.search,
          $options: "i",
        };
      }


      if (req.query.state) {
        filter.state = req.query.state;
      }


      if (req.query.city) {
        filter.city = req.query.city;
      }


      if (req.query.sport) {
        filter.sport = req.query.sport;
      }


      if (req.query.competitionType) {
        filter.competitionType = req.query.competitionType;
      }


      if (req.query.format) {
        filter.format = req.query.format;
      }

      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.startDateFrom || req.query.startDateTo) {
        const startDate: Record<string, Date> = {};

        if (req.query.startDateFrom) {
          startDate.$gte = new Date(
            String(req.query.startDateFrom),
          );
        }

        if (req.query.startDateTo) {
          startDate.$lte = new Date(
            String(req.query.startDateTo),
          );
        }

        filter.startDate = startDate;
      }

      if (req.query.minEntryFee || req.query.maxEntryFee) {
        const entryFee: Record<string, number> = {};

        if (req.query.minEntryFee) {
          entryFee.$gte = Number(req.query.minEntryFee);
        }

        if (req.query.maxEntryFee) {
          entryFee.$lte = Number(req.query.maxEntryFee);
        }

        filter.entryFee = entryFee;
      }


      const result =
        await tournamentService.getTournaments(
          filter,
          page,
          limit
        );


      return res.status(200).json({
        success: true,
        ...result,
      });


    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  }



  async getMyTournaments(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const tournaments =
        await tournamentService.getMyTournaments(user.id);

      return res.status(200).json({
        success: true,
        data: tournaments,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getById(
    req: Request,
    res: Response
  ) {

    try {

      const tournament =
        await tournamentService.getTournamentById(
            req.params.id as string
                );


      if (!tournament) {
        return res.status(404).json({
          success:false,
          message:"Tournament not found",
        });
      }


      return res.json({
        success:true,
        data:tournament,
      });


    } catch(error:any){

      return res.status(500).json({
        success:false,
        message:error.message,
      });

    }

  }



  async update(
    req: Request,
    res: Response
  ) {

    try {

      const user = req.user as {
        id: string;
        role: string;
      };

      const tournament =
        await tournamentService.updateTournament(
          req.params.id as string,
          req.body,
          user
        );

      return res.json({
        success: true,
        data: tournament,
      });

    } catch (error: any) {

      return res.status(403).json({
        success: false,
        message: error.message,
      });

    }

  }

  async approve(
    req: Request,
    res: Response
  ) {
    try {
      const tournament =
        await tournamentService.approveTournament(
          req.params.id as string
        );

      return res.json({
        success: true,
        message: "Tournament approved successfully.",
        data: tournament,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found."
          ? 404
          : 400;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }


  async reject(
    req: Request,
    res: Response
  ) {
    try {
      const tournament =
        await tournamentService.rejectTournament(
          req.params.id as string
        );

      return res.json({
        success: true,
        message: "Tournament rejected successfully.",
        data: tournament,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found."
          ? 404
          : 400;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }


  async createCrewRequirement(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const { role, quantity } = req.body;

      const requirement =
        await tournamentCrewRequirementService.createRequirement(
          req.params.id as string,
          {
            role,
            quantity,
          },
          user
        );

      return res.status(201).json({
        success: true,
        message: "Crew requirement created successfully.",
        data: requirement,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCrewRequirements(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const requirements =
        await tournamentCrewRequirementService.getRequirements(
          req.params.id as string,
          user
        );

      return res.status(200).json({
        success: true,
        count: requirements.length,
        data: requirements,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


  async assignCrew(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const { crewId } = req.body;

      const assignment =
        await tournamentCrewAssignmentService.assignCrew(
          req.params.id as string,
          crewId,
          user
        );

      return res.status(201).json({
        success: true,
        message: "Crew assigned to tournament successfully.",
        data: assignment,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found." ||
        error.message === "Crew member not found."
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


  async startCrewWork(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const assignment =
        await tournamentCrewAssignmentService.startWork(
          req.params.assignmentId as string,
          user
        );

      return res.status(200).json({
        success: true,
        message: "Crew work started successfully.",
        data: assignment,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew assignment not found." ||
        error.message === "Crew member not found."
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

  async verifyCrewCompletion(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const assignment =
        await tournamentCrewAssignmentService.verifyCompletion(
          req.params.assignmentId as string,
          user
        );

      return res.status(200).json({
        success: true,
        message: "Crew work completion verified successfully.",
        data: assignment,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew assignment not found." ||
        error.message === "Tournament not found."
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

  async submitCrewCompletion(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const {
        completionProof,
        completionNote,
      } = req.body;

      const assignment =
        await tournamentCrewAssignmentService.submitCompletion(
          req.params.assignmentId as string,
          {
            completionProof,
            completionNote,
          },
          user
        );

      return res.status(200).json({
        success: true,
        message: "Crew work completion submitted successfully.",
        data: assignment,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew assignment not found." ||
        error.message === "Crew member not found."
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

  async findCrewCandidates(
    req: Request,
    res: Response
  ) {
    try {
      const user =
        req.user as {
          id: string;
          role: string;
        };

      const candidates =
        await tournamentCrewAssignmentService
          .findCrewCandidates(
            req.params.id as string,
            req.params.requirementId as string,
            user
          );

      return res.status(200).json({
        success: true,
        count: candidates.length,
        data: candidates,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found." ||
        error.message === "Crew requirement not found."
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

  async assignCrewToRequirement(
    req: Request,
    res: Response
  ) {
    try {
      const user =
        req.user as {
          id: string;
          role: string;
        };

      const { crewId } = req.body;

      const assignment =
        await tournamentCrewAssignmentService
          .assignCrewToRequirement(
            req.params.id as string,
            req.params.requirementId as string,
            crewId,
            user
          );

      return res.status(201).json({
        success: true,
        message:
          "Crew assigned to requirement successfully.",
        data: assignment,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found." ||
        error.message === "Crew requirement not found." ||
        error.message === "Crew member not found."
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

  async getCrew(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const crew =
        await tournamentCrewAssignmentService.getTournamentCrew(
          req.params.id as string,
          user
        );

      return res.status(200).json({
        success: true,
        count: crew.length,
        data: crew,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found."
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



  async getMyCrewAssignments(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const assignments =
        await tournamentCrewAssignmentService.getMyAssignments(
          user
        );

      return res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew profile not found."
          ? 404
          : 400;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }


  async inviteCrew(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const {
        crewId,
        message,
      } = req.body;

      const invitation =
        await tournamentCrewInvitationService.inviteCrew(
          req.params.id as string,
          req.params.requirementId as string,
          crewId,
          message,
          user
        );

      return res.status(201).json({
        success: true,
        message: "Crew invitation sent successfully.",
        data: invitation,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found." ||
        error.message === "Crew requirement not found." ||
        error.message === "Crew member not found."
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

  async getMyCrewInvitations(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const invitations =
        await tournamentCrewInvitationService
          .getMyInvitations(user);

      return res.status(200).json({
        success: true,
        count: invitations.length,
        data: invitations,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew profile not found."
          ? 404
          : 400;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async respondToCrewInvitation(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const { response } = req.body;

      if (
        response !== "ACCEPTED" &&
        response !== "DECLINED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Response must be ACCEPTED or DECLINED.",
        });
      }

      const result =
        await tournamentCrewInvitationService
          .respondToInvitation(
            req.params.invitationId as string,
            response,
            user
          );

      return res.status(200).json({
        success: true,
        message:
          response === "ACCEPTED"
            ? "Crew invitation accepted successfully."
            : "Crew invitation declined successfully.",
        data: result,
      });
    } catch (error: any) {
      const status =
        error.message === "Crew invitation not found." ||
        error.message === "Crew member not found."
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

  async getCrewInvitations(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const requirementId =
        typeof req.query.requirementId === "string"
          ? req.query.requirementId
          : undefined;

      const invitations =
        await tournamentCrewInvitationService
          .getTournamentInvitations(
            req.params.id as string,
            requirementId,
            user
          );

      return res.status(200).json({
        success: true,
        count: invitations.length,
        data: invitations,
      });
    } catch (error: any) {
      const status =
        error.message === "Tournament not found."
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

  async publishCrewWorkOpportunities(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const result =
        await tournamentCrewWorkOpportunityService.publishOpportunities(
          req.params.id as string,
          req.body,
          user
        );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const message = error.message || "Failed to publish crew work opportunities.";

      const status =
        message === "Tournament not found."
          ? 404
          : message.includes("permission")
            ? 403
            : 400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async getCrewWorkOpportunities(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const opportunities =
        await tournamentCrewWorkOpportunityService.getTournamentOpportunities(
          req.params.id as string,
          user
        );

      return res.status(200).json({
        success: true,
        count: opportunities.length,
        data: opportunities,
      });
    } catch (error: any) {
      const message = error.message || "Failed to fetch crew work opportunities.";

      const status =
        message === "Tournament not found."
          ? 404
          : message.includes("permission")
            ? 403
            : 400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async getMyCrewWorkApplications(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const applications =
        await tournamentCrewWorkApplicationService.getMyApplications(
          user
        );

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error: any) {
      const message =
        error.message ||
        "Failed to fetch your crew work applications.";

      const status =
        message.includes("not found") ? 404 : 400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async applyForCrewWorkOpportunity(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const application =
        await tournamentCrewWorkApplicationService.apply(
          req.params.opportunityId as string,
          req.body,
          user
        );

      return res.status(201).json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      const message =
        error.message ||
        "Failed to apply for crew work opportunity.";

      const status =
        message.includes("permission") ? 403 :
        message.includes("not found") ? 404 :
        400;

      return res.status(status).json({
        success: false,
        message,
        ...(error.code
          ? { code: error.code }
          : {}),
        ...(error.conflictTournament
          ? { conflictTournament: error.conflictTournament }
          : {}),
      });
    }
  }

  async getCrewWorkApplications(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const applications =
        await tournamentCrewWorkApplicationService
          .getApplicationsForOpportunity(
            req.params.opportunityId as string,
            user
          );

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error: any) {
      const message =
        error.message ||
        "Failed to fetch crew work applications.";

      const status =
        message.includes("permission") ? 403 :
        message.includes("not found") ? 404 :
        400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async acceptCrewWorkApplication(
    req: Request,
    res: Response
  ) {
    try {
      const user = req.user as {
        id: string;
        role: string;
      };

      const result =
        await tournamentCrewWorkApplicationService
          .acceptApplication(
            req.params.applicationId as string,
            user
          );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const message =
        error.message ||
        "Failed to accept crew work application.";

      const status =
        message.includes("permission") ? 403 :
        message.includes("not found") ? 404 :
        400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async getOpenCrewWorkOpportunities(
    req: Request,
    res: Response
  ) {
    try {
      const opportunities =
        await tournamentCrewWorkOpportunityService.getOpenOpportunities();

      return res.status(200).json({
        success: true,
        count: opportunities.length,
        data: opportunities,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch open crew work opportunities.",
      });
    }
  }

  async remove(
    req: Request,
    res: Response
  ) {

    try {

      const user = req.user as {
        id: string;
        role: string;
      };

      await tournamentService.deleteTournament(
        req.params.id as string,
        user
      );

      return res.json({
        success: true,
        message: "Tournament deleted successfully",
      });

    } catch (error: any) {

      return res.status(403).json({
        success: false,
        message: error.message,
      });

    }

  }

}


export const tournamentController =
  new TournamentController();