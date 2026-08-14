import { CrewModel } from "../models/crew.model.js";

export class CrewRepository {
  async findByUserId(userId: string) {
    return CrewModel.findOne({ userId });
  }

  async create(data: {
    userId: string;
    fullName: string;
    role: string;
    sportsExpertise: string[];
    city: string;
    state: string;
    experienceYears: number;
  }) {
    return CrewModel.create(data);
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    return CrewModel.findOneAndUpdate(
      { userId },
      { isAvailable },
      { new: true }
    );
  }

  async findAvailable(city?: string, sport?: string) {
    const filter: {
      isAvailable: boolean;
      city?: string;
      sportsExpertise?: string;
    } = {
      isAvailable: true,
    };

    if (city) filter.city = city;
    if (sport) filter.sportsExpertise = sport;

    return CrewModel.find(filter);
  }
}

export const crewRepository = new CrewRepository();
