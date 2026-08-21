import bcrypt from "bcrypt";

import { connectDatabase } from "../config/database.js";
import { User, UserRole } from "../modules/users/models/user.model.js";
import {
  OrganizerVerification,
  VerificationStatus,
} from "../modules/organizerVerification/models/organizerVerification.model.js";

const EMAIL = "venue.test.organizer@sportora.test";
const PASSWORD = "VenueTest@2026";

async function main() {
  await connectDatabase();

  let user = await User.findOne({ email: EMAIL });

  if (!user) {
    const password = await bcrypt.hash(PASSWORD, 10);

    user = await User.create({
      fullName: "Venue Test Organizer",
      email: EMAIL,
      password,
      phone: "9876543210",
      role: UserRole.ORGANIZER,
      isVerified: true,
      city: "Jaipur",
      state: "Rajasthan",
      profileImage: "",
      bio: "Temporary organizer for venue verification QA testing.",
      interests: ["Football"],
      achievements: [],
    });

    console.log("✅ Test organizer created.");
  } else {
    console.log("ℹ️ Test organizer already exists.");
  }

  await OrganizerVerification.findOneAndUpdate(
    { organizer: user._id },
    {
      organizer: user._id,
      organizationName: "Venue Test Sports Organization",
      governmentIdType: "QA_TEST_ID",
      governmentId: "VENUE-TEST-2026",
      documentUrl: "https://example.com/venue-test-id.pdf",
      address: "Venue Test Ground, Jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      status: VerificationStatus.APPROVED,
      remarks: "Temporary QA organizer for venue verification testing.",
      reviewedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("✅ Organizer verification = APPROVED.");
  console.log("");
  console.log("Email:", EMAIL);
  console.log("Password:", PASSWORD);
  console.log("Role:", user.role);
  console.log("Organizer ID:", user._id.toString());
  console.log("");
  console.log("🎯 Ready for fresh tournament + venue verification testing.");

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Failed to create test organizer:", error);
  process.exit(1);
});
