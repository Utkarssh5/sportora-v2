import type { Request, Response } from 'express';
import { CrewModel } from '../models/crew.model.js';

export const registerCrew = async (req: Request, res: Response) => {
  try {
    const { userId, fullName, role, sportsExpertise, city, state, experienceYears } = req.body;

    let existingCrew = await CrewModel.findOne({ userId });
    if (existingCrew) {
      return res.status(400).json({ success: false, message: 'Crew profile already exists for this user.' });
    }

    const crew = await CrewModel.create({
      userId,
      fullName,
      role,
      sportsExpertise,
      city,
      state,
      experienceYears,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered in the Ground Crew Marketplace.',
      data: crew,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableCrew = async (req: Request, res: Response) => {
  try {
    const { city, sport } = req.query;
    const filter: any = { isAvailable: true };

    if (city) filter.city = city;
    if (sport) filter.sportsExpertise = sport;

    const crewList = await CrewModel.find(filter);

    res.status(200).json({
      success: true,
      count: crewList.length,
      data: crewList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
