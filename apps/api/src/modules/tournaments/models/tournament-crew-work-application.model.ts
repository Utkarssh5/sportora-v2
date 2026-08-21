import mongoose, {
  Document,
  Schema,
} from "mongoose";

export enum TournamentCrewWorkApplicationStatus {
  APPLIED = "APPLIED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export interface ITournamentCrewWorkApplication
  extends Document {
  opportunityId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  requirementId: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;

  message?: string;

  status: TournamentCrewWorkApplicationStatus;

  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
}

const TournamentCrewWorkApplicationSchema =
  new Schema<ITournamentCrewWorkApplication>(
    {
      opportunityId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentCrewWorkOpportunity",
        required: true,
        index: true,
      },

      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      requirementId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentCrewRequirement",
        required: true,
        index: true,
      },

      crewId: {
        type: Schema.Types.ObjectId,
        ref: "Crew",
        required: true,
        index: true,
      },

      message: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      status: {
        type: String,
        enum: Object.values(
          TournamentCrewWorkApplicationStatus
        ),
        default:
          TournamentCrewWorkApplicationStatus.APPLIED,
        index: true,
      },

      appliedAt: {
        type: Date,
        default: Date.now,
        index: true,
      },

      reviewedAt: {
        type: Date,
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
  );

TournamentCrewWorkApplicationSchema.index(
  {
    opportunityId: 1,
    crewId: 1,
  },
  { unique: true }
);

TournamentCrewWorkApplicationSchema.index({
  crewId: 1,
  status: 1,
  appliedAt: -1,
});

export const TournamentCrewWorkApplicationModel =
  mongoose.model<ITournamentCrewWorkApplication>(
    "TournamentCrewWorkApplication",
    TournamentCrewWorkApplicationSchema
  );
