import mongoose, { Schema, Document } from 'mongoose';

export enum VerificationStep {
  OTP_VERIFIED = 'OTP_VERIFIED',
  GOVT_ID_SUBMITTED = 'GOVT_ID_SUBMITTED',
  ORGANIZATION_SUBMITTED = 'ORGANIZATION_SUBMITTED',
  VENUE_PROOF_SUBMITTED = 'VENUE_PROOF_SUBMITTED',
  COMPLETED = 'COMPLETED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IOrganizer extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName?: string;
  govtIdType: 'AADHAAR' | 'PAN' | 'PASSPORT';
  govtIdNumber: string;
  govtIdDocumentUrl: string;
  selfieUrl: string;
  currentStep: VerificationStep;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: Date;
}

const OrganizerSchema = new Schema<IOrganizer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationName: { type: String },
    govtIdType: { type: String, enum: ['AADHAAR', 'PAN', 'PASSPORT'], required: true },
    govtIdNumber: { type: String, required: true },
    govtIdDocumentUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },
    currentStep: { 
      type: String, 
      enum: Object.values(VerificationStep), 
      default: VerificationStep.OTP_VERIFIED 
    },
    status: { 
      type: String, 
      enum: Object.values(VerificationStatus), 
      default: VerificationStatus.PENDING 
    },
    rejectionReason: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const OrganizerModel = mongoose.model<IOrganizer>('Organizer', OrganizerSchema);