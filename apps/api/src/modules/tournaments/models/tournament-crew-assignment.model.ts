import mongoose, { Schema, Document } from "mongoose";

export interface ITournamentCrewAssignment extends Document {
  tournamentId: mongoose.Types.ObjectId;
  crewId: mongoose.Types.ObjectId;
  assignedAt: Date;
}

const TournamentCrewAssignmentSchema =
  new Schema<ITournamentCrewAssignment>(
    {
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
      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true }
  );

TournamentCrewAssignmentSchema.index(
  { tournamentId: 1, crewId: 1 },
  { unique: true }
);

export const TournamentCrewAssignmentModel =
  mongoose.model<ITournamentCrewAssignment>(
    "TournamentCrewAssignment",
    TournamentCrewAssignmentSchema
  );
