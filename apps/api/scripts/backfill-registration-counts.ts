import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { TournamentModel } from "../src/modules/tournaments/models/tournament.model.js";
import { TournamentRegistration } from "../src/modules/tournamentRegistration/models/tournamentRegistration.model.js";

async function main() {
  await mongoose.connect(env.MONGODB_URI);

  const tournaments = await TournamentModel.find().select("_id").lean();

  for (const tournament of tournaments) {
    const count = await TournamentRegistration.countDocuments({
      tournamentId: tournament._id,
      status: "REGISTERED",
    });

    await TournamentModel.updateOne(
      { _id: tournament._id },
      { $set: { registeredParticipants: count } }
    );

    console.log(
      `${tournament._id.toString()} -> ${count} registered`
    );
  }

  await mongoose.disconnect();
  console.log("Backfill complete.");
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
