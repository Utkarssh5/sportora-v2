import mongoose, { Schema, Document } from 'mongoose';
import type { CompetitionType } from '../../sports/config/sport-competition.config.js';

export enum TournamentType {
  SOLO = 'SOLO',
  DUO = 'DUO',
  TEAM = 'TEAM',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ITournament extends Document {
  organizerId: mongoose.Types.ObjectId;
  title: string;
  sport: string;
  format: string;
  type: TournamentType;
  competitionType?: CompetitionType;
  competitionRules?: {
    participantCount: number;
    requiresRoster: boolean;
    defaultPlayingSize?: number;
    allowsSubstitutes?: boolean;
    requiresMixedGender?: boolean;
  };
  city: string;
  state: string;
  locationName: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  venuePhotos: string[];
  venueVideos: string[];
  permissionDocs: string[];
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  registeredParticipants: number;
  entryFee: number;
  prizePool: number;
  sponsors: { name: string; logoUrl?: string }[];
  status: TournamentStatus;
  aiRiskScore?: number;
  aiRiskAnalysis?: string;
}

const TournamentSchema = new Schema<ITournament>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    sport: { type: String, required: true },
    format: { type: String, required: true },
    type: { type: String, enum: Object.values(TournamentType), required: true },
    competitionType: {
      type: String,
      enum: [
        'SINGLES',
        'DOUBLES',
        'MIXED_DOUBLES',
        'TEAM',
        'RELAY',
      ],
    },
    competitionRules: {
      participantCount: { type: Number, required: false },
      requiresRoster: { type: Boolean, required: false },
      defaultPlayingSize: { type: Number, required: false },
      allowsSubstitutes: { type: Boolean, required: false },
      requiresMixedGender: { type: Boolean, required: false },
    },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    locationName: { type: String, required: true },
    pincode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
    venuePhotos: [{ type: String }],
    venueVideos: [{ type: String }],
    permissionDocs: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    registeredParticipants: { type: Number, required: true, default: 0 },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    sponsors: [{ name: String, logoUrl: String }],
    status: { 
      type: String, 
      enum: Object.values(TournamentStatus), 
      default: TournamentStatus.PENDING_APPROVAL 
    },
    aiRiskScore: { type: Number, default: 0 },
    aiRiskAnalysis: { type: String },
  },
  { timestamps: true }
);

export const TournamentModel = mongoose.model<ITournament>('Tournament', TournamentSchema);