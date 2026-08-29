import mongoose, { Document, Schema } from "mongoose";

export enum VenueVerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  MORE_PROOF_REQUIRED = "MORE_PROOF_REQUIRED",
  REJECTED = "REJECTED",
}

export interface IVenueVerification extends Document {
  tournament: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;

  venueName: string;
  venueAddress: string;
  city: string;
  state: string;
  pincode?: string;

  venuePhotos: string[];
  venueVideos: string[];
  permissionDocs: string[];

  venueType: string;
  bookingStatus: string;
  proofType: string;
  venueContactName?: string;
  venueContactPhone?: string;
  expectedBookingDate?: Date;
  venueCommunication?: string;

  status: VenueVerificationStatus;
  remarks?: string;
  proofDeadline?: Date;

  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const VenueVerificationSchema = new Schema<IVenueVerification>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      unique: true,
      index: true,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    venueName: {
      type: String,
      required: true,
      trim: true,
    },

    venueAddress: {
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

    venuePhotos: [{ type: String }],
    venueVideos: [{ type: String }],
    permissionDocs: [{ type: String }],

    venueType: {
      type: String,
      trim: true,
      default: "OTHER",
    },

    bookingStatus: {
      type: String,
      trim: true,
      default: "BOOKED",
    },

    proofType: {
      type: String,
      trim: true,
      default: "OTHER",
    },

    venueContactName: {
      type: String,
      trim: true,
    },

    venueContactPhone: {
      type: String,
      trim: true,
    },

    expectedBookingDate: {
      type: Date,
    },

    venueCommunication: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: Object.values(VenueVerificationStatus),
      default: VenueVerificationStatus.PENDING,
      index: true,
    },

    remarks: {
      type: String,
      default: "",
    },

    proofDeadline: {
      type: Date,
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const VenueVerification =
  mongoose.model<IVenueVerification>(
    "VenueVerification",
    VenueVerificationSchema
  );
