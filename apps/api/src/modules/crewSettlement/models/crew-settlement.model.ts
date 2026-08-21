import mongoose, { Document, Schema } from "mongoose";

export enum CrewSettlementStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface ICrewSettlement extends Document {
  assignmentId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;

  amount?: number;
  currency: string;

  status: CrewSettlementStatus;
  provider: string;

  verifiedAt: Date;
  paidAt?: Date;

  providerReference?: string;
  failureReason?: string;
}

const CrewSettlementSchema =
  new Schema<ICrewSettlement>(
    {
      assignmentId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentCrewAssignment",
        required: true,
        unique: true,
        index: true,
      },

      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      crewId: {
        type: Schema.Types.ObjectId,
        ref: "Crew",
        required: true,
        index: true,
      },

      amount: {
        type: Number,
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
        enum: Object.values(CrewSettlementStatus),
        default: CrewSettlementStatus.PENDING,
        index: true,
      },

      provider: {
        type: String,
        default: "DEMO",
        trim: true,
      },

      verifiedAt: {
        type: Date,
        required: true,
      },

      paidAt: {
        type: Date,
      },

      providerReference: {
        type: String,
        trim: true,
      },

      failureReason: {
        type: String,
        trim: true,
      },
    },
    { timestamps: true }
  );

CrewSettlementSchema.index({
  crewId: 1,
  status: 1,
  createdAt: -1,
});

export const CrewSettlementModel =
  mongoose.model<ICrewSettlement>(
    "CrewSettlement",
    CrewSettlementSchema
  );
