import mongoose from "mongoose";
import { MatchModel } from "./src/modules/match/models/match.model.js";
import { TournamentModel } from "./src/modules/tournaments/models/tournament.model.js";
import { tournamentRegistrationRepository } from "./src/modules/tournamentRegistration/repositories/tournamentRegistration.repository.js";

const userId = "6a7ff85fe724ad6046e1aa40";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const matches = await MatchModel.find({
    status: "COMPLETED",
    $or: [{ teamA: userId }, { teamB: userId }],
  }).lean();

  const registrations =
    await tournamentRegistrationRepository.findByUser(userId);

  console.log("\n=== HIPPO MATCHES ===");
  console.log(JSON.stringify(matches, null, 2));

  console.log("\n=== HIPPO REGISTRATIONS ===");
  console.log(
    JSON.stringify(
      registrations.map((r: any) => ({
        id: r._id,
        status: r.status,
        tournamentId: r.tournamentId?._id ?? r.tournamentId,
        tournamentTitle: r.tournamentId?.title,
        tournamentStatus: r.tournamentId?.status,
      })),
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
