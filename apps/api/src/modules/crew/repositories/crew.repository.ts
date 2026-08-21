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
    skills: string[];
    city: string;
    state: string;
    experienceYears: number;
  }) {
    return CrewModel.create(data);
  }

  async findById(crewId: string) {
    return CrewModel.findById(crewId);
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    return CrewModel.findOneAndUpdate(
      { userId },
      { isAvailable },
      { new: true }
    );
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
    return CrewModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async findAvailable(
    filtersOrCity?: {
      role?: string;
      sport?: string;
      city?: string;
      state?: string;
      isAvailable?: boolean;
      minExperience?: number;
      minRating?: number;
    } | string,
    legacySport?: string
  ) {
    type CrewSearchFilters = {
      role?: string;
      sport?: string;
      city?: string;
      state?: string;
      isAvailable?: boolean;
      minExperience?: number;
      minRating?: number;
    };

    let filters: CrewSearchFilters = {};

    if (typeof filtersOrCity === "string") {
      filters.city = filtersOrCity;

      if (legacySport) {
        filters.sport = legacySport;
      }

      filters.isAvailable = true;
    } else if (filtersOrCity) {
      filters = filtersOrCity;
    }

    const filter: {
      isAvailable?: boolean;
      role?: string;
      city?: string;
      state?: string;
      sportsExpertise?: string;
      experienceYears?: { $gte: number };
      rating?: { $gte: number };
    } = {};

    if (filters.isAvailable !== undefined) {
      filter.isAvailable = filters.isAvailable;
    }

    if (filters.role?.trim()) {
      filter.role = filters.role.trim().toUpperCase();
    }

    if (filters.sport?.trim()) {
      filter.sportsExpertise = filters.sport.trim();
    }

    if (filters.city?.trim()) {
      filter.city = filters.city.trim();
    }

    if (filters.state?.trim()) {
      filter.state = filters.state.trim();
    }

    if (filters.minExperience !== undefined) {
      filter.experienceYears = {
        $gte: filters.minExperience,
      };
    }

    if (filters.minRating !== undefined) {
      filter.rating = {
        $gte: filters.minRating,
      };
    }

    return CrewModel.find(filter).sort({
      isAvailable: -1,
      rating: -1,
      experienceYears: -1,
      fullName: 1,
    });
  }
}

export const crewRepository = new CrewRepository();
