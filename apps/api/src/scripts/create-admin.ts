import bcrypt from "bcrypt";

import { connectDatabase } from "../config/database.js";
import { User, UserRole } from "../modules/users/models/user.model.js";

const ADMIN_EMAIL = "admin@sportora.test";
const ADMIN_PASSWORD = "Admin@12345";

async function createAdmin() {
  await connectDatabase();

  const existingAdmin = await User.findOne({
    email: ADMIN_EMAIL,
  });

  if (existingAdmin) {
    if (existingAdmin.role !== UserRole.ADMIN) {
      existingAdmin.role = UserRole.ADMIN;
      existingAdmin.isVerified = true;
      await existingAdmin.save();

      console.log("✅ Existing account promoted to ADMIN:", ADMIN_EMAIL);
    } else {
      console.log("✅ ADMIN account already exists:", ADMIN_EMAIL);
    }

    await User.db.close();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    fullName: "Sportora Administrator",
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: UserRole.ADMIN,
    isVerified: true,
  });

  console.log("✅ ADMIN account created:", ADMIN_EMAIL);

  await User.db.close();
}

createAdmin().catch(async (error) => {
  console.error("❌ Failed to create ADMIN:", error);
  await User.db.close().catch(() => undefined);
  process.exit(1);
});
