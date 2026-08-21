import mongoose from "mongoose";
import { User } from "./src/modules/users/models/user.model.js";
import { env } from "./src/config/env.js";

async function main() {
  await mongoose.connect(env.MONGODB_URI);

  const user = await User.findOne(
    { email: "razorpaytest@example.com" },
    { _id: 1, fullName: 1, email: 1, role: 1, password: 1 }
  ).lean();

  if (!user) {
    console.log("USER_EXISTS=false");
  } else {
    console.log("USER_EXISTS=true");
    console.log("USER_ID=" + user._id);
    console.log("FULL_NAME=" + user.fullName);
    console.log("EMAIL=" + user.email);
    console.log("ROLE=" + user.role);
    console.log("PASSWORD_HASH_EXISTS=" + Boolean(user.password));
    console.log("PASSWORD_HASH_LENGTH=" + (user.password?.length ?? 0));
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
