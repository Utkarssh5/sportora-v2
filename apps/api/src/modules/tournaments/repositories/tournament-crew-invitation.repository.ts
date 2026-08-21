import {
  TournamentCrewInvitationModel,
} from "../models/tournament-crew-invitation.model.js";

class TournamentCrewInvitationRepository {
  async create(data: {
    tournamentId: string;
    requirementId: string;
    crewId: string;
    invitedBy: string;
    eventDate: Date;
    message?: string;
  }) {
    return TournamentCrewInvitationModel.create(data);
  }

  async findById(invitationId: string) {
    return TournamentCrewInvitationModel.findById(
      invitationId
    );
  }

  async findByTournamentRequirementCrew(
    tournamentId: string,
    requirementId: string,
    crewId: string
  ) {
    return TournamentCrewInvitationModel.findOne({
      tournamentId,
      requirementId,
      crewId,
      status: {
        $in: ["INVITED", "ACCEPTED"],
      },
    });
  }

  async findByCrewId(crewId: string) {
    return TournamentCrewInvitationModel.find({
      crewId,
    })
      .populate("tournamentId")
      .populate("requirementId")
      .sort({ createdAt: -1 });
  }

  async findByTournament(
    tournamentId: string,
    requirementId?: string
  ) {
    const filter: {
      tournamentId: string;
      requirementId?: string;
    } = {
      tournamentId,
    };

    if (requirementId) {
      filter.requirementId = requirementId;
    }

    return TournamentCrewInvitationModel.find(filter)
      .populate("crewId")
      .populate("requirementId")
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    invitationId: string,
    status: string
  ) {
    return TournamentCrewInvitationModel.findByIdAndUpdate(
      invitationId,
      {
        status,
        respondedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

export const tournamentCrewInvitationRepository =
  new TournamentCrewInvitationRepository();
