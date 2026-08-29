import bcrypt from "bcrypt";
import {
  createAndSendOtp,
  verifyOtp,
} from "./otp.service.js";
import { authRepository } from "../repositories/auth.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../lib/jwt.js";

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

  if (!user.isVerified) {
    throw new Error(
      "Please verify your email before logging in.",
    );
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

  if (!user.isVerified) {
    throw new Error(
      "Please verify your email before logging in.",
    );
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
