import mongoose, { Schema, Document } from "mongoose";

export enum TournamentCrewInvitationStatus {
  INVITED = "INVITED",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
}

export interface ITournamentCrewInvitation extends Document {
  tournamentId: mongoose.Types.ObjectId;
  requirementId: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  eventDate: Date;
  status: TournamentCrewInvitationStatus;
  message?: string;
  invitedAt: Date;
  respondedAt?: Date;
}

const TournamentCrewInvitationSchema =
  new Schema<ITournamentCrewInvitation>(
    {
      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      requirementId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentCrewRequirement",
        required: true,
        index: true,
      },

      crewId: {
        type: Schema.Types.ObjectId,
        ref: "Crew",
        required: true,
        index: true,
      },

      invitedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      eventDate: {
        type: Date,
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: Object.values(TournamentCrewInvitationStatus),
        default: TournamentCrewInvitationStatus.INVITED,
        index: true,
      },

      message: {
        type: String,
        trim: true,
      },

      invitedAt: {
        type: Date,
        default: Date.now,
      },

      respondedAt: {
        type: Date,
      },
    },
    { timestamps: true }
  );

TournamentCrewInvitationSchema.index({
  tournamentId: 1,
  requirementId: 1,
  crewId: 1,
});

TournamentCrewInvitationSchema.index({
  crewId: 1,
  status: 1,
});

TournamentCrewInvitationSchema.index({
  tournamentId: 1,
  status: 1,
});

export const TournamentCrewInvitationModel =
  mongoose.model<ITournamentCrewInvitation>(
    "TournamentCrewInvitation",
    TournamentCrewInvitationSchema
  );
