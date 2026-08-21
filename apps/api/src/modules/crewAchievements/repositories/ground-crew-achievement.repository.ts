import {
  GroundCrewAchievementModel,
} from "../models/ground-crew-achievement.model.js";

class GroundCrewAchievementRepository {
  async findByAssignmentId(assignmentId: string) {
    return GroundCrewAchievementModel.findOne({
      assignmentId,
    });
  }

  async create(data: {
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
    return GroundCrewAchievementModel.create(data);
  }

  async findByUserId(userId: string) {
    return GroundCrewAchievementModel.find({
      userId,
    }).sort({
      verifiedAt: -1,
    });
  }
}

export const groundCrewAchievementRepository =
  new GroundCrewAchievementRepository();
