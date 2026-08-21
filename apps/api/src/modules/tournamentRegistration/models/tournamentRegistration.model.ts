import mongoose, { Schema, Document } from "mongoose";

export enum RegistrationStatus {
  REGISTERED = "REGISTERED",
  CANCELLED = "CANCELLED",
}

export interface ITournamentRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ticketId?: string;
}

const TournamentRegistrationSchema =
  new Schema<ITournamentRegistration>(
    {
      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: Object.values(RegistrationStatus),
        default: RegistrationStatus.REGISTERED,
      },

      registeredAt: {
        type: Date,
        default: Date.now,
      },

      ticketId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

TournamentRegistrationSchema.index(
  { tournamentId: 1, userId: 1 },
  { unique: true }
);

export const TournamentRegistration =
  mongoose.model<ITournamentRegistration>(
    "TournamentRegistration",
    TournamentRegistrationSchema
  );
