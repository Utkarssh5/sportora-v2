import type { Request, Response, NextFunction } from "express";
import { locationService } from "../services/location.service.js";

export const getByCity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const city =
      typeof req.query.city === "string"
        ? req.query.city
        : "";

    const state =
      typeof req.query.state === "string"
        ? req.query.state
        : undefined;

    const locations =
      await locationService.getByCity(city, state);

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const getStates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const states = await locationService.getStates();

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states.sort(),
    });
  } catch (error) {
    next(error);
  }
};

export const getByState = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const state =
      typeof req.query.state === "string"
        ? req.query.state
        : "";

    const locations =
      await locationService.getByState(state);

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const searchLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q
        : "";

    const locations =
      await locationService.search(query);

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};
