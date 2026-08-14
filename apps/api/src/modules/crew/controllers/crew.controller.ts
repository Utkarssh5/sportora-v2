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
      fullName,
      role,
      sportsExpertise,
      city,
      state,
      experienceYears,
    } = req.body;

    const crew = await crewService.registerCrew({
      userId: user.id,
      fullName,
      role,
      sportsExpertise,
      city,
      state,
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
