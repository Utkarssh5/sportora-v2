import type { Request, Response } from "express";

import { tournamentService } from "../services/tournament.service.js";
import {
  tournamentCrewAssignmentService,
} from "../services/tournament-crew-assignment.service.js";


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


      if (req.query.city) {
        filter.city = req.query.city;
      }


      if (req.query.sport) {
        filter.sport = req.query.sport;
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