import mongoose from "mongoose";

const userId = "6a7ff85fe724ad6046e1aa40";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection unavailable");

  const matches = await db.collection("matches").find({
    status: "COMPLETED",
    $or: [{ teamA: userId }, { teamB: userId }],
  }).toArray();

  const registrations = await db.collection("tournamentregistrations").find({
    userId: new mongoose.Types.ObjectId(userId),
  }).toArray();

  const tournamentIds = registrations
    .map((r: any) => r.tournamentId)
    .filter(Boolean);

  const tournaments = await db.collection("tournaments").find({
    _id: { $in: tournamentIds },
  }).toArray();

  console.log("\n=== HIPPO COMPLETED MATCHES ===");
  console.log(JSON.stringify(matches, null, 2));

  console.log("\n=== HIPPO REGISTRATIONS ===");
  console.log(JSON.stringify(registrations, null, 2));

  console.log("\n=== HIPPO TOURNAMENTS ===");
  console.log(JSON.stringify(tournaments, null, 2));

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
