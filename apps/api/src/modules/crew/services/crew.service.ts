import { crewRepository } from "../repositories/crew.repository.js";

export class CrewService {
  async registerCrew(data: {
    userId: string;
    fullName: string;
    role: string;
    sportsExpertise: string[];
    city: string;
    state: string;
    experienceYears: number;
  }) {
    const existingCrew = await crewRepository.findByUserId(data.userId);

    if (existingCrew) {
      throw new Error("Crew profile already exists for this user.");
    }

    return crewRepository.create(data);
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const crew = await crewRepository.findByUserId(userId);

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return crewRepository.updateAvailability(userId, isAvailable);
  }

  async getAvailableCrew(city?: string, sport?: string) {
    return crewRepository.findAvailable(city, sport);
  }
}

export const crewService = new CrewService();
