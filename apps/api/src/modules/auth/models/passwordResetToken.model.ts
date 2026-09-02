import mongoose, { Schema, type Document } from "mongoose";

export interface IPasswordResetToken extends Document {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema =
  new Schema<IPasswordResetToken>(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    },
  );

PasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export const PasswordResetToken =
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema,
  );

