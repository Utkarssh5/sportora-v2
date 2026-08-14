import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  PLAYER = "PLAYER",
  ORGANIZER = "ORGANIZER",
  ADMIN = "ADMIN",
  REFEREE = "REFEREE",
  UMPIRE = "UMPIRE",
  VOLUNTEER = "VOLUNTEER",
  SPONSOR = "SPONSOR",
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;

  role: UserRole;

  isVerified: boolean;

  profileImage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PLAYER,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);