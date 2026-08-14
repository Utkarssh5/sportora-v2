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
    crewId: string
  ) {
    return TournamentCrewAssignmentModel.create({
      tournamentId,
      crewId,
    });
  }

  async findByTournament(tournamentId: string) {
    return TournamentCrewAssignmentModel
      .find({ tournamentId })
      .populate("crewId");
  }
}

export const tournamentCrewAssignmentRepository =
  new TournamentCrewAssignmentRepository();
