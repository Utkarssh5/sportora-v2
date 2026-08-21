import mongoose, { Schema, Document } from "mongoose";

export enum TournamentCrewWorkOpportunityStatus {
  OPEN = "OPEN",
  FILLED = "FILLED",
  CANCELLED = "CANCELLED",
}

export interface ITournamentCrewWorkOpportunity
  extends Document {
  tournamentId: mongoose.Types.ObjectId;
  requirementId: mongoose.Types.ObjectId;

  role: string;
  quantity: number;
  filledQuantity: number;

  payoutAmount: number;
  currency: string;

  status: TournamentCrewWorkOpportunityStatus;

  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentCrewWorkOpportunitySchema =
  new Schema<ITournamentCrewWorkOpportunity>(
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

      role: {
        type: String,
        required: true,
        trim: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      filledQuantity: {
        type: Number,
        default: 0,
        min: 0,
      },

      payoutAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true,
      },

      status: {
        type: String,
        enum: Object.values(
          TournamentCrewWorkOpportunityStatus
        ),
        default:
          TournamentCrewWorkOpportunityStatus.OPEN,
        index: true,
      },

      publishedAt: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    { timestamps: true }
  );

TournamentCrewWorkOpportunitySchema.index({
  tournamentId: 1,
  status: 1,
});

TournamentCrewWorkOpportunitySchema.index({
  requirementId: 1,
});

export const TournamentCrewWorkOpportunityModel =
  mongoose.model<ITournamentCrewWorkOpportunity>(
    "TournamentCrewWorkOpportunity",
    TournamentCrewWorkOpportunitySchema
  );
