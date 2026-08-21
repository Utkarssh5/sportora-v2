import type { Request, Response, NextFunction } from "express";

import { crewService } from "../services/crew.service.js";

export const registerCrew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };

    const {
      role,
      sportsExpertise,
      skills,
      experienceYears,
    } = req.body;

    const crew = await crewService.registerCrew({
      userId: user.id,
      role,
      sportsExpertise,
      skills,
      experienceYears,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered in the Ground Crew Marketplace.",
      data: crew,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCrewProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };

    const crew = await crewService.getMyCrewProfile(user.id);

    return res.status(200).json({
      success: true,
      data: crew,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCrewProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };
    const body = req.body ?? {};

    const data: {
      role?: string;
      sportsExpertise?: string[];
      skills?: string[];
      experienceYears?: number;
    } = {};

    if (body.role !== undefined) {
      if (typeof body.role !== "string" || !body.role.trim()) {
        return res.status(400).json({
          success: false,
          message: "Valid crew role is required.",
        });
      }

      data.role = body.role.trim().toUpperCase();
    }

    if (body.sportsExpertise !== undefined) {
      if (!Array.isArray(body.sportsExpertise)) {
        return res.status(400).json({
          success: false,
          message: "sportsExpertise must be an array.",
        });
      }

      data.sportsExpertise = body.sportsExpertise
        .filter((item: unknown): item is string => typeof item === "string")
        .map((item: string) => item.trim())
        .filter(Boolean)
        .slice(0, 10);

      if (!data.sportsExpertise?.length) {
        return res.status(400).json({
          success: false,
          message: "At least one sport is required.",
        });
      }
    }

    if (body.skills !== undefined) {
      if (!Array.isArray(body.skills)) {
        return res.status(400).json({
          success: false,
          message: "skills must be an array.",
        });
      }

      data.skills = body.skills
        .filter((item: unknown): item is string => typeof item === "string")
        .map((item: string) => item.trim())
        .filter(Boolean)
        .slice(0, 20);
    }

    if (body.experienceYears !== undefined) {
      const experienceYears = Number(body.experienceYears);

      if (
        !Number.isFinite(experienceYears) ||
        experienceYears < 0 ||
        experienceYears > 60
      ) {
        return res.status(400).json({
          success: false,
          message: "Experience must be between 0 and 60 years.",
        });
      }

      data.experienceYears = experienceYears;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile changes were provided.",
      });
    }

    const crew = await crewService.updateProfile(user.id, data);

    return res.status(200).json({
      success: true,
      message: "Crew profile updated successfully.",
      data: crew,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableCrew = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const city =
      typeof req.query.city === "string" ? req.query.city : undefined;

    const sport =
      typeof req.query.sport === "string" ? req.query.sport : undefined;

    const crewList = await crewService.getAvailableCrew(city, sport);

    return res.status(200).json({
      success: true,
      count: crewList.length,
      data: crewList,
    });
  } catch (error) {
    next(error);
  }
};

export const getCrewProfilePreview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const crew = await crewService.getCrewProfilePreview(
      req.params.crewId as string
    );

    return res.status(200).json({
      success: true,
      data: crew,
    });
  } catch (error) {
    if ((error as Error).message === "Crew profile not found.") {
      return res.status(404).json({
        success: false,
        message: (error as Error).message,
      });
    }

    next(error);
  }
};

export const updateCrewAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as { id: string };

    const { isAvailable } = req.body;

    const crew = await crewService.updateAvailability(
      user.id,
      isAvailable
    );

    return res.status(200).json({
      success: true,
      message: "Crew availability updated successfully.",
      data: crew,
    });
  } catch (error) {
    next(error);
  }
};
