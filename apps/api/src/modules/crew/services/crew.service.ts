import { tournamentRepository } from "../../tournaments/repositories/tournament.repository.js";
import { TournamentStatus } from "../../tournaments/models/tournament.model.js";
import { tournamentRegistrationRepository } from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";
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
    /*
     * Ground Crew is an additional Sportora capability.
     *
     * BUSINESS RULES
     *
     * 1. Only PLAYER and ORGANIZER accounts may activate Ground Crew.
     * 2. Existing Ground Crew profile is idempotent.
     * 3. PLAYER cannot activate while registered in an active/upcoming
     *    tournament.
     * 4. ORGANIZER cannot activate while responsible for an active/upcoming
     *    tournament.
     * 5. Completed/cancelled/ended tournaments do not block activation.
     * 6. Primary account role is never changed.
     * 7. City/state are required for crew discovery.
     */

    const user = await userRepository.findById(data.userId);

    if (!user) {
      throw new Error("User profile not found.");
    }

    if (user.role !== "PLAYER" && user.role !== "ORGANIZER") {
      throw new Error(
        "Only player or organizer accounts can activate Ground Crew."
      );
    }

    /*
     * Idempotency:
     * A user can have only one Ground Crew profile.
     */
    const existingCrew = await crewRepository.findByUserId(data.userId);

    if (existingCrew) {
      return existingCrew;
    }

    const now = new Date();

    /*
     * PLAYER GUARD
     *
     * Only registered tournament registrations matter.
     * Cancelled registrations are excluded by the repository.
     *
     * A registration blocks crew activation when its tournament:
     * - has not ended yet
     * - is not COMPLETED/CANCELLED
     */
    if (user.role === "PLAYER") {
      const registrations =
        await tournamentRegistrationRepository
          .findRegisteredByUserWithTournaments(data.userId);

      const conflictingRegistration = registrations.find(
        (registration: any) => {
          const tournament = registration?.tournamentId;

          if (
            !tournament?.startDate ||
            !tournament?.endDate
          ) {
            return false;
          }

          if (
            tournament.status === TournamentStatus.COMPLETED ||
            tournament.status === TournamentStatus.CANCELLED
          ) {
            return false;
          }

          return new Date(tournament.endDate) >= now;
        }
      );

      if (conflictingRegistration) {
        const tournament =
          conflictingRegistration.tournamentId as any;

        throw new Error(
          `You cannot activate Ground Crew while you are registered as a player in an active or upcoming tournament${
            tournament?.title
              ? `: ${tournament.title}`
              : "."
          }`
        );
      }
    }

    /*
     * ORGANIZER GUARD
     *
     * Use the repository's canonical "active organizer tournament"
     * definition instead of duplicating status logic here.
     */
    if (user.role === "ORGANIZER") {
      const activeTournament =
        await tournamentRepository.findActiveByOrganizer(data.userId);

      if (
        activeTournament &&
        activeTournament.startDate &&
        activeTournament.endDate &&
        new Date(activeTournament.endDate) >= now
      ) {
        throw new Error(
          `You cannot activate Ground Crew while you have an active or upcoming tournament${
            activeTournament.title
              ? `: ${activeTournament.title}`
              : "."
          }`
        );
      }
    }

    /*
     * Crew discovery depends on location.
     */
    if (!user.city?.trim() || !user.state?.trim()) {
      throw new Error(
        "Please complete your profile city and state before becoming Ground Crew."
      );
    }

    /*
     * IMPORTANT:
     *
     * PLAYER remains PLAYER.
     * ORGANIZER remains ORGANIZER.
     *
     * Ground Crew is an additional operational profile.
     */
    return crewRepository.create({
      userId: data.userId,
      fullName: user.fullName,
      role: data.role.trim().toUpperCase(),
      sportsExpertise: data.sportsExpertise,
      skills: data.skills,
      city: user.city.trim(),
      state: user.state.trim(),
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
