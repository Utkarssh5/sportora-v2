import mongoose, { Schema, Document } from 'mongoose';

export enum CrewRole {
  REFEREE = 'REFEREE',
  UMPIRE = 'UMPIRE',
  SCOREKEEPER = 'SCOREKEEPER',
  VOLUNTEER = 'VOLUNTEER',
}

export interface ICrew extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  role: CrewRole;
  sportsExpertise: string[];
  city: string;
  state: string;
  experienceYears: number;
  isAvailable: boolean;
  rating: number;
}

const CrewSchema = new Schema<ICrew>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: Object.values(CrewRole), required: true },
    sportsExpertise: [{ type: String, required: true }],
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    experienceYears: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 5.0 },
  },
  { timestamps: true }
);

export const CrewModel = mongoose.model<ICrew>('Crew', CrewSchema);
