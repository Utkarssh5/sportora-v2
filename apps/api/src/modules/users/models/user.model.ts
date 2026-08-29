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
  mustChangePassword: boolean;

  profileImage?: string;

  bio?: string;
  city?: string;
  state?: string;
  primarySport?: string;
  interests?: string[];
  achievements?: string[];

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

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 250,
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    primarySport: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    interests: {
      type: [String],
      default: [],
    },

    achievements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);