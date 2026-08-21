import {
  groundCrewAchievementRepository,
} from "../repositories/ground-crew-achievement.repository.js";

export class GroundCrewAchievementService {
  async createForVerifiedAssignment(data: {
    userId: string;
    assignmentId: string;
    tournamentId: string;
    crewId: string;
    role: string;
    sport: string;
    tournamentTitle: string;
    eventDate: Date;
    city: string;
    state: string;
    verifiedAt: Date;
  }) {
    const existing =
      await groundCrewAchievementRepository.findByAssignmentId(
        data.assignmentId
      );

    if (existing) {
      return existing;
    }

    return groundCrewAchievementRepository.create(data);
  }

  async getByUserId(userId: string) {
    return groundCrewAchievementRepository.findByUserId(userId);
  }
}

export const groundCrewAchievementService =
  new GroundCrewAchievementService();
