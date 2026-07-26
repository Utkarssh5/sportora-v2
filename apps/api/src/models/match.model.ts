import mongoose, { Schema, Document } from 'mongoose';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IMatch extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  status: MatchStatus;
  winner?: string;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    teamA: { type: String, required: true },
    teamB: { type: String, required: true },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    currentSet: { type: Number, default: 1 },
    status: { type: String, enum: Object.values(MatchStatus), default: MatchStatus.SCHEDULED },
    winner: { type: String },
  },
  { timestamps: true }
);

export const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);
