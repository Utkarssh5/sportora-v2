import {
  TournamentCrewAssignmentModel,
} from "../models/tournament-crew-assignment.model.js";

class TournamentCrewAssignmentRepository {
  async findByTournamentAndCrew(
    tournamentId: string,
    crewId: string
  ) {
    return TournamentCrewAssignmentModel.findOne({
      tournamentId,
      crewId,
    });
  }

  async create(
    tournamentId: string,
    crewId: string,
    data?: {
      requirementId?: string;
      eventDate: Date;
      agreedPayoutAmount?: number;
    }
  ) {
    return TournamentCrewAssignmentModel.create({
      tournamentId,
      crewId,
      requirementId: data?.requirementId,
      eventDate: data?.eventDate,
      agreedPayoutAmount: data?.agreedPayoutAmount,
    });
  }

  async findByTournament(tournamentId: string) {
    return TournamentCrewAssignmentModel
      .find({ tournamentId })
      .populate("crewId");
  }

  async findByCrewId(crewId: string) {
    return TournamentCrewAssignmentModel
      .find({ crewId })
      .populate("crewId")
      .populate("tournamentId");
  }

  async findById(assignmentId: string) {
    return TournamentCrewAssignmentModel.findById(
      assignmentId
    );
  }

  async updateStatus(
    assignmentId: string,
    update: Record<string, unknown>
  ) {
    return TournamentCrewAssignmentModel.findByIdAndUpdate(
      assignmentId,
      update,
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

export const tournamentCrewAssignmentRepository =
  new TournamentCrewAssignmentRepository();
