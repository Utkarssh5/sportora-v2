import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./src/modules/users/models/user.model.js";

const email = "hippo@gmail.com";
const newPassword = "Sportora@2026";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

await mongoose.connect(uri);

const hashedPassword = await bcrypt.hash(newPassword, 10);

const user = await User.findOneAndUpdate(
  { email },
  { password: hashedPassword },
  { new: true }
);

if (!user) {
  console.error(`❌ User not found: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

console.log(`✅ Password reset for ${email}`);
console.log(`✅ New password: ${newPassword}`);

await mongoose.disconnect();
