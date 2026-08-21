import bcrypt from "bcrypt";
import crypto from "crypto";

import { User, UserRole } from "../models/user.model.js";
import { sendAdminWelcomeEmail } from "../../../lib/email/email.service.js";
import { generateAccessToken } from "../../../lib/jwt.js";

function generateTemporaryPassword() {
  return `SPT-${crypto.randomBytes(4).toString("hex")}-${crypto.randomBytes(3).toString("hex")}`;
}

export class AdminService {
  async createAdmin(data: {
    fullName: string;
    email: string;
  }) {
    const email = data.email.trim().toLowerCase();

    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const admin = await User.create({
      fullName: data.fullName.trim(),
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      mustChangePassword: true,
    });

    try {
      await sendAdminWelcomeEmail(
        admin.email,
        admin.fullName,
        temporaryPassword,
      );
    } catch (error) {
      await User.deleteOne({ _id: admin._id });

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to send admin welcome email.",
      );
    }

    return {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      emailSent: true,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      throw new Error("Current password is incorrect.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;

    await user.save();

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      mustChangePassword: false,
    });

    return {
      accessToken,
    };
  }
}

export const adminService = new AdminService();
