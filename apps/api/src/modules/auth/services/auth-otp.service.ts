import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  createAndSendOtp,
  verifyOtp,
} from "./otp.service.js";
import { authRepository } from "../repositories/auth.repository.js";
import { PasswordResetToken } from "../models/passwordResetToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../lib/jwt.js";

export async function startForgotPasswordOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user =
    await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    return;
  }

  await createAndSendOtp(
    normalizedEmail,
    "FORGOT_PASSWORD",
  );
}

export async function startRegistrationOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser =
    await authRepository.findByEmail(normalizedEmail);

  if (!existingUser) {
    throw new Error(
      "Registration details not found. Please register again.",
    );
  }

  await createAndSendOtp(
    normalizedEmail,
    "REGISTER",
  );
}

export async function verifyRegistrationOtp(
  email: string,
  otp: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  await verifyOtp(
    normalizedEmail,
    otp,
    "REGISTER",
  );

  const user =
    await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("User not found.");
  }

  user.isVerified = true;
  await user.save();

  return user;
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  await verifyOtp(
    normalizedEmail,
    otp,
    "FORGOT_PASSWORD",
  );

  const user =
    await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Unable to reset password.");
  }

  await PasswordResetToken.deleteMany({
    email: normalizedEmail,
  });

  const resetToken =
    crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await PasswordResetToken.create({
    email: normalizedEmail,
    tokenHash,
    expiresAt: new Date(
      Date.now() + 10 * 60 * 1000,
    ),
  });

  return {
    resetToken,
  };
}

export async function resetForgotPassword(
  resetToken: string,
  newPassword: string,
) {
  if (!resetToken || resetToken.length < 20) {
    throw new Error("Invalid or expired password reset token.");
  }

  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters long.",
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


  const resetRecord = await PasswordResetToken.findOne({
    tokenHash,
  });

  if (!resetRecord) {
    throw new Error("Invalid or expired password reset token.");
  }

  if (resetRecord.expiresAt.getTime() <= Date.now()) {
    await resetRecord.deleteOne();
    throw new Error("Password reset token has expired.");
  }

  const user = await authRepository.findByEmail(resetRecord.email);

  if (!user) {
    await resetRecord.deleteOne();
    throw new Error("Unable to reset password.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.isVerified = true;

  await user.save();
  await resetRecord.deleteOne();

  return true;
}
export async function startLoginOtp(
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const user =
    await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password,
  );

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  await createAndSendOtp(
    normalizedEmail,
    "LOGIN",
  );
}

export async function verifyLoginOtp(
  email: string,
  otp: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  await verifyOtp(
    normalizedEmail,
    otp,
    "LOGIN",
  );

  const user =
    await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    throw new Error("User not found.");
  }

  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
    mustChangePassword:
      user.mustChangePassword === true,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}
