import {
  TournamentCrewWorkApplicationModel,
  TournamentCrewWorkApplicationStatus,
} from "../models/tournament-crew-work-application.model.js";

class TournamentCrewWorkApplicationRepository {
  async create(data: {
    opportunityId: string;
    tournamentId: string;
    requirementId: string;
    crewId: string;
    message?: string;
  }) {
    return TournamentCrewWorkApplicationModel.create({
      opportunityId: data.opportunityId,
      tournamentId: data.tournamentId,
      requirementId: data.requirementId,
      crewId: data.crewId,
      message: data.message?.trim(),
      status:
        TournamentCrewWorkApplicationStatus.APPLIED,
      appliedAt: new Date(),
    });
  }

  async findById(id: string) {
    return TournamentCrewWorkApplicationModel.findById(id);
  }

  async findByOpportunity(opportunityId: string) {
    return TournamentCrewWorkApplicationModel.find({
      opportunityId,
    }).sort({ appliedAt: 1 });
  }

  async findByCrew(crewId: string) {
    return TournamentCrewWorkApplicationModel.find({
      crewId,
    }).sort({ appliedAt: -1 });
  }

  async findByOpportunityAndCrew(
    opportunityId: string,
    crewId: string
  ) {
    return TournamentCrewWorkApplicationModel.findOne({
      opportunityId,
      crewId,
    });
  }

  async findPendingByOpportunity(
    opportunityId: string
  ) {
    return TournamentCrewWorkApplicationModel.find({
      opportunityId,
      status:
        TournamentCrewWorkApplicationStatus.APPLIED,
    }).sort({ appliedAt: 1 });
  }

  async updateStatus(
    id: string,
    status: TournamentCrewWorkApplicationStatus,
    reviewedBy: string
  ) {
    return TournamentCrewWorkApplicationModel.findByIdAndUpdate(
      id,
      {
        status,
        reviewedAt: new Date(),
        reviewedBy,
      },
      { new: true }
    );
  }
}

export const tournamentCrewWorkApplicationRepository =
  new TournamentCrewWorkApplicationRepository();
