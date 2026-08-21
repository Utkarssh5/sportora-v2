import mongoose, { Schema, Document } from "mongoose";

export enum TournamentCrewRequirementStatus {
  OPEN = "OPEN",
  PARTIALLY_FILLED = "PARTIALLY_FILLED",
  FILLED = "FILLED",
  CANCELLED = "CANCELLED",
}

export interface ITournamentCrewRequirement extends Document {
  tournamentId: mongoose.Types.ObjectId;
  role: string;
  quantity: number;
  filledQuantity: number;
  status: TournamentCrewRequirementStatus;
}

const TournamentCrewRequirementSchema =
  new Schema<ITournamentCrewRequirement>(
    {
      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
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

      // Organizer declares this only after registration deadline.
      status: {
        type: String,
        enum: Object.values(TournamentCrewRequirementStatus),
        default: TournamentCrewRequirementStatus.OPEN,
      },

    },
    { timestamps: true }
  );

TournamentCrewRequirementSchema.index({
  tournamentId: 1,
  status: 1,
});

export const TournamentCrewRequirementModel =
  mongoose.model<ITournamentCrewRequirement>(
    "TournamentCrewRequirement",
    TournamentCrewRequirementSchema
  );
