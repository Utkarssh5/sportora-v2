import mongoose, { Schema, Document } from "mongoose";

export type AuthOtpPurpose =
  | "REGISTER"
  | "LOGIN"
  | "FORGOT_PASSWORD";

export interface IAuthOtp extends Document {
  email: string;
  otpHash: string;
  purpose: AuthOtpPurpose;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const AuthOtpSchema = new Schema<IAuthOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: [
        "REGISTER",
        "LOGIN",
        "FORGOT_PASSWORD",
      ],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

/*
 * MongoDB automatically removes expired OTP documents.
 */
AuthOtpSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export const AuthOtp = mongoose.model<IAuthOtp>(
  "AuthOtp",
  AuthOtpSchema,
);
