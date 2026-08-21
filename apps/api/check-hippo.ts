import mongoose from "mongoose";
import { User } from "./src/modules/users/models/user.model.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const users = await User.find({
    $or: [
      { email: "hippo@gmail.com" },
      { fullName: "hippo" },
    ],
  }).select("_id fullName email role city state");

  console.log(JSON.stringify(users, null, 2));

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
