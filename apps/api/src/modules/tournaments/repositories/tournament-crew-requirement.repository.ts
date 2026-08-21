import {
  TournamentCrewRequirementModel,
  TournamentCrewRequirementStatus,
} from "../models/tournament-crew-requirement.model.js";

class TournamentCrewRequirementRepository {
  async create(data: {
    tournamentId: string;
    role: string;
    quantity: number;
  }) {
    return TournamentCrewRequirementModel.create({
      tournamentId: data.tournamentId,
      role: data.role,
      quantity: data.quantity,
      filledQuantity: 0,
    });
  }

  async findByTournament(tournamentId: string) {
    return TournamentCrewRequirementModel.find({
      tournamentId,
    }).sort({ createdAt: 1 });
  }

  async findById(requirementId: string) {
    return TournamentCrewRequirementModel.findById(requirementId);
  }

  async incrementFilledQuantity(
    requirementId: string
  ) {
    const requirement =
      await TournamentCrewRequirementModel.findById(
        requirementId
      );

    if (!requirement) {
      return null;
    }

    if (
      requirement.filledQuantity >=
      requirement.quantity
    ) {
      return requirement;
    }

    requirement.filledQuantity += 1;

    requirement.status =
      requirement.filledQuantity >=
      requirement.quantity
        ? TournamentCrewRequirementStatus.FILLED
        : TournamentCrewRequirementStatus.PARTIALLY_FILLED;

    return requirement.save();
  }

}

export const tournamentCrewRequirementRepository =
  new TournamentCrewRequirementRepository();
