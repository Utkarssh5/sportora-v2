import mongoose, { Schema, Document } from "mongoose";

export enum TournamentCrewAssignmentStatus {
  ASSIGNED = "ASSIGNED",
  WORKING = "WORKING",
  COMPLETION_SUBMITTED = "COMPLETION_SUBMITTED",
  VERIFIED = "VERIFIED",
  PAYOUT_PENDING = "PAYOUT_PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export interface ITournamentCrewAssignment extends Document {
  tournamentId: mongoose.Types.ObjectId;
  requirementId?: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;

  eventDate: Date;

  agreedPayoutAmount?: number;

  status: TournamentCrewAssignmentStatus;

  workStartedAt?: Date;
  workCompletedAt?: Date;

  completionProof?: string[];
  completionNote?: string;

  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;

  assignedAt: Date;
}

const TournamentCrewAssignmentSchema =
  new Schema<ITournamentCrewAssignment>(
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
        index: true,
      },

      crewId: {
        type: Schema.Types.ObjectId,
        ref: "Crew",
        required: true,
        index: true,
      },

      eventDate: {
        type: Date,
        required: true,
        index: true,
      },

      agreedPayoutAmount: {
        type: Number,
        min: 0,
      },

      status: {
        type: String,
        enum: Object.values(TournamentCrewAssignmentStatus),
        default: TournamentCrewAssignmentStatus.ASSIGNED,
        index: true,
      },

      workStartedAt: {
        type: Date,
      },

      workCompletedAt: {
        type: Date,
      },

      completionProof: {
        type: [String],
        default: [],
      },

      completionNote: {
        type: String,
        trim: true,
      },

      verifiedAt: {
        type: Date,
      },

      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true }
  );

TournamentCrewAssignmentSchema.index(
  { tournamentId: 1, crewId: 1 },
  { unique: true }
);

export const TournamentCrewAssignmentModel =
  mongoose.model<ITournamentCrewAssignment>(
    "TournamentCrewAssignment",
    TournamentCrewAssignmentSchema
  );
