import "dotenv/config";
import mongoose from "mongoose";
import { seedIndiaLocations } from "./location.seed.js";
import { INDIA_LOCATION_DATA } from "./india-location.data.js";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured.");
}

try {
  await mongoose.connect(mongoUri);

  const count = await seedIndiaLocations(
    INDIA_LOCATION_DATA
  );

  console.log(
    `India location seed completed. Processed ${count} locations.`
  );
} catch (error) {
  console.error("India location seed failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
