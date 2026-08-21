import mongoose, { Schema, Document } from "mongoose";

export enum MatchStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MatchRound {
  ROUND_1 = "ROUND_1",
  ROUND_2 = "ROUND_2",
  QUARTER_FINAL = "QUARTER_FINAL",
  SEMI_FINAL = "SEMI_FINAL",
  FINAL = "FINAL",
}

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;

  round: MatchRound;
  matchNumber: number;

  teamA: string;
  teamB: string;

  scoreA: number;
  scoreB: number;

  currentSet: number;

  status: MatchStatus;

  winner?: string;

  nextMatchId?: mongoose.Types.ObjectId;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },

    round: {
      type: String,
      enum: Object.values(MatchRound),
      required: true,
    },

    matchNumber: {
      type: Number,
      required: true,
    },

    teamA: {
      type: String,
      required: true,
    },

    teamB: {
      type: String,
      required: true,
    },

    scoreA: {
      type: Number,
      default: 0,
    },

    scoreB: {
      type: Number,
      default: 0,
    },

    currentSet: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.SCHEDULED,
    },

    winner: {
      type: String,
    },

    nextMatchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
  },
  {
    timestamps: true,
  }
);

MatchSchema.index(
  {
    tournamentId: 1,
    round: 1,
    matchNumber: 1,
  },
  {
    unique: true,
  }
);

export const MatchModel = mongoose.model<IMatch>(
  "Match",
  MatchSchema
);
