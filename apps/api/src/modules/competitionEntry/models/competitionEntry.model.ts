import mongoose, { Document, Schema } from "mongoose";

export enum CompetitionEntryStatus {
  PENDING_DETAILS = "PENDING_DETAILS",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum CompetitionParticipantRole {
  CAPTAIN = "CAPTAIN",
  PLAYER = "PLAYER",
  SUBSTITUTE = "SUBSTITUTE",
}

export interface ICompetitionParticipant {
  userId: mongoose.Types.ObjectId;
  role: CompetitionParticipantRole;
}

export interface ICompetitionEntry extends Document {
  tournamentId: mongoose.Types.ObjectId;
  registrationId: mongoose.Types.ObjectId;
  captainId: mongoose.Types.ObjectId;
  competitionType: string;
  displayName?: string;
  participants: ICompetitionParticipant[];
  teamSheetUrl?: string;
  status: CompetitionEntryStatus;
  rejectionReason?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionParticipantSchema =
  new Schema<ICompetitionParticipant>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: Object.values(CompetitionParticipantRole),
        required: true,
      },
    },
    { _id: false }
  );

const CompetitionEntrySchema =
  new Schema<ICompetitionEntry>(
    {
      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      registrationId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentRegistration",
        required: true,
        unique: true,
        index: true,
      },

      captainId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      competitionType: {
        type: String,
        required: true,
        enum: [
          "SINGLES",
          "DOUBLES",
          "MIXED_DOUBLES",
          "TEAM",
          "RELAY",
        ],
      },

      displayName: {
        type: String,
        trim: true,
      },

      participants: {
        type: [CompetitionParticipantSchema],
        default: [],
      },

      teamSheetUrl: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: Object.values(CompetitionEntryStatus),
        default: CompetitionEntryStatus.PENDING_DETAILS,
        index: true,
      },

      rejectionReason: {
        type: String,
        trim: true,
      },

      submittedAt: {
        type: Date,
      },

      approvedAt: {
        type: Date,
      },
    },
    { timestamps: true }
  );

CompetitionEntrySchema.index({
  tournamentId: 1,
  captainId: 1,
});

export const CompetitionEntry =
  mongoose.model<ICompetitionEntry>(
    "CompetitionEntry",
    CompetitionEntrySchema
  );
