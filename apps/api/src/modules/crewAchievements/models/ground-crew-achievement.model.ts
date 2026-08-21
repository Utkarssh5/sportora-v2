import mongoose, { Schema, Document } from "mongoose";

export interface IGroundCrewAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  tournamentId: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;

  role: string;
  sport: string;
  tournamentTitle: string;

  eventDate: Date;
  city: string;
  state: string;

  verifiedAt: Date;
}

const GroundCrewAchievementSchema =
  new Schema<IGroundCrewAchievement>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      assignmentId: {
        type: Schema.Types.ObjectId,
        ref: "TournamentCrewAssignment",
        required: true,
        unique: true,
      },

      tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
        index: true,
      },

      crewId: {
        type: Schema.Types.ObjectId,
        ref: "Crew",
        required: true,
        index: true,
      },

      role: {
        type: String,
        required: true,
        trim: true,
      },

      sport: {
        type: String,
        required: true,
        trim: true,
      },

      tournamentTitle: {
        type: String,
        required: true,
        trim: true,
      },

      eventDate: {
        type: Date,
        required: true,
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

      verifiedAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

GroundCrewAchievementSchema.index({
  userId: 1,
  verifiedAt: -1,
});

export const GroundCrewAchievementModel =
  mongoose.model<IGroundCrewAchievement>(
    "GroundCrewAchievement",
    GroundCrewAchievementSchema
  );
