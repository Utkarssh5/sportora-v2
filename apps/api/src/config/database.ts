import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  console.log("================================");
  console.log("Node:", process.version);
  console.log("Mongoose:", mongoose.version);
  console.log("================================");

  try {
    await mongoose.connect(env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.dir(err, { depth: null });
    process.exit(1);
  }
}