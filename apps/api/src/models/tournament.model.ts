import mongoose, { Schema, Document } from 'mongoose';

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
  city: string;
  state: string;
  locationName: string;
  pincode: string;
  venuePhotos: string[];
  venueVideos: string[];
  permissionDocs: string[];
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  sponsors: { name: string; logoUrl?: string }[];
  status: TournamentStatus;
  aiRiskScore?: number;
  aiRiskAnalysis?: string;
}

const TournamentSchema = new Schema<ITournament>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'Organizer', required: true },
    title: { type: String, required: true },
    sport: { type: String, required: true },
    format: { type: String, required: true },
    type: { type: String, enum: Object.values(TournamentType), required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    locationName: { type: String, required: true },
    pincode: { type: String, required: true },
    venuePhotos: [{ type: String }],
    venueVideos: [{ type: String }],
    permissionDocs: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
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