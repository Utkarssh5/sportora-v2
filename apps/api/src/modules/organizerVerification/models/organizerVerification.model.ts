import mongoose, { Document, Schema } from "mongoose";

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IOrganizerVerification extends Document {
  organizer: mongoose.Types.ObjectId;

  organizationName: string;

  governmentIdType: string;
  governmentId: string;
  documentUrl?: string;

  address: string;
  city: string;
  state: string;
  pincode?: string;

  status: VerificationStatus;
  remarks?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrganizerVerificationSchema =
  new Schema<IOrganizerVerification>(
    {
      organizer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      organizationName: {
        type: String,
        required: true,
        trim: true,
      },

      governmentIdType: {
        type: String,
        required: true,
        trim: true,
      },

      governmentId: {
        type: String,
        required: true,
        trim: true,
      },

      documentUrl: {
        type: String,
        required: false,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: false,
        trim: true,
      },

      status: {
        type: String,
        enum: Object.values(VerificationStatus),
        default: VerificationStatus.PENDING,
      },

      remarks: {
        type: String,
        default: "",
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      reviewedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

export const OrganizerVerification =
  mongoose.model<IOrganizerVerification>(
    "OrganizerVerification",
    OrganizerVerificationSchema
  );
