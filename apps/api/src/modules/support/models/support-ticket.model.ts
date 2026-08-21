import { Schema, model, Types } from "mongoose";

export enum SupportCategory {
  TOURNAMENT = "TOURNAMENT",
  ORGANIZER = "ORGANIZER",
  ACCOUNT = "ACCOUNT",
}

export enum SupportStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum SupportPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const supportTicketSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tournamentId: {
      type: Types.ObjectId,
      ref: "Tournament",
      default: null,
      index: true,
    },
    registrationId: {
      type: Types.ObjectId,
      ref: "TournamentRegistration",
      default: null,
      index: true,
    },

    category: {
      type: String,
      enum: Object.values(SupportCategory),
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: Object.values(SupportStatus),
      default: SupportStatus.OPEN,
      index: true,
    },

    priority: {
      type: String,
      enum: Object.values(SupportPriority),
      default: SupportPriority.MEDIUM,
    },

    adminResponse: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const SupportTicket = model("SupportTicket", supportTicketSchema);
