import {
  TournamentCrewWorkOpportunityModel,
  TournamentCrewWorkOpportunityStatus,
} from "../models/tournament-crew-work-opportunity.model.js";

class TournamentCrewWorkOpportunityRepository {
  async create(data: {
    tournamentId: string;
    requirementId: string;
    role: string;
    quantity: number;
    payoutAmount: number;
  }) {
    return TournamentCrewWorkOpportunityModel.create({
      tournamentId: data.tournamentId,
      requirementId: data.requirementId,
      role: data.role,
      quantity: data.quantity,
      filledQuantity: 0,
      payoutAmount: data.payoutAmount,
      currency: "INR",
      status:
        TournamentCrewWorkOpportunityStatus.OPEN,
    });
  }

  async findById(id: string) {
    return TournamentCrewWorkOpportunityModel.findById(id);
  }

  async findByTournament(tournamentId: string) {
    return TournamentCrewWorkOpportunityModel.find({
      tournamentId,
    }).sort({ createdAt: -1 });
  }

  async findOpen() {
    return TournamentCrewWorkOpportunityModel.find({
      status:
        TournamentCrewWorkOpportunityStatus.OPEN,
    })
      .populate(
        "tournamentId",
        "title sport format type competitionType city state locationName startDate endDate organizerId"
      )
      .sort({ publishedAt: -1 });
  }

  async incrementFilledQuantity(id: string) {
    const opportunity =
      await TournamentCrewWorkOpportunityModel.findById(
        id
      );

    if (!opportunity) {
      return null;
    }

    if (
      opportunity.filledQuantity >=
      opportunity.quantity
    ) {
      return opportunity;
    }

    opportunity.filledQuantity += 1;

    if (
      opportunity.filledQuantity >=
      opportunity.quantity
    ) {
      opportunity.status =
        TournamentCrewWorkOpportunityStatus.FILLED;
    }

    return opportunity.save();
  }

  async cancel(id: string) {
    return TournamentCrewWorkOpportunityModel.findByIdAndUpdate(
      id,
      {
        status:
          TournamentCrewWorkOpportunityStatus.CANCELLED,
      },
      { new: true }
    );
  }
}

export const tournamentCrewWorkOpportunityRepository =
  new TournamentCrewWorkOpportunityRepository();
