import { crewRepository } from "../repositories/crew.repository.js";
import { userRepository } from "../../users/repositories/user.repository.js";

export class CrewService {
  async registerCrew(data: {
    userId: string;
    role: string;
    sportsExpertise: string[];
    skills: string[];
    experienceYears: number;
  }) {
    const existingCrew = await crewRepository.findByUserId(data.userId);

    if (existingCrew) {
      throw new Error("Crew profile already exists for this user.");
    }

    const user = await userRepository.findById(data.userId);

    if (!user) {
      throw new Error("User profile not found.");
    }

    if (!user.city || !user.state) {
      throw new Error(
        "Please complete your profile city and state before becoming Ground Crew."
      );
    }

    return crewRepository.create({
      userId: data.userId,
      fullName: user.fullName,
      role: data.role,
      sportsExpertise: data.sportsExpertise,
      skills: data.skills,
      city: user.city,
      state: user.state,
      experienceYears: data.experienceYears,
    });
  }

  async getMyCrewProfile(userId: string) {
    return crewRepository.findByUserId(userId);
  }

  async getCrewProfilePreview(crewId: string) {
    const crew = await crewRepository.findById(crewId);

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return {
      id: crew._id,
      fullName: crew.fullName,
      role: crew.role,
      sportsExpertise: crew.sportsExpertise,
      skills: crew.skills,
      city: crew.city,
      state: crew.state,
      experienceYears: crew.experienceYears,
      rating: crew.rating,
      isAvailable: crew.isAvailable,
    };
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const crew = await crewRepository.findByUserId(userId);

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return crewRepository.updateAvailability(userId, isAvailable);
  }

  async updateProfile(
    userId: string,
    data: {
      role?: string;
      sportsExpertise?: string[];
      skills?: string[];
      experienceYears?: number;
    }
  ) {
    const crew = await crewRepository.findByUserId(userId);

    if (!crew) {
      throw new Error("Crew profile not found.");
    }

    return crewRepository.updateProfile(userId, data);
  }

  async getAvailableCrew(
    filtersOrCity?: {
      role?: string;
      sport?: string;
      city?: string;
      state?: string;
      isAvailable?: boolean;
      minExperience?: number;
      minRating?: number;
    } | string,
    sport?: string
  ) {
    if (typeof filtersOrCity === "string") {
      const filters: {
        city: string;
        sport?: string;
        isAvailable: boolean;
      } = {
        city: filtersOrCity,
        isAvailable: true,
      };

      if (sport) {
        filters.sport = sport;
      }

      return crewRepository.findAvailable(filters);
    }

    return crewRepository.findAvailable(filtersOrCity);
  }
}

export const crewService = new CrewService();
