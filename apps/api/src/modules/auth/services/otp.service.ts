import crypto from "crypto";
import bcrypt from "bcrypt";
import { AuthOtp } from "../models/authOtp.model.js";
import {
  sendOtpEmail,
} from "./email.service.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export async function createAndSendOtp(
  email: string,
  purpose:
    | "REGISTER"
    | "LOGIN"
    | "FORGOT_PASSWORD",
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  /*
   * Only one active OTP per email + purpose.
   */
  await AuthOtp.deleteMany({
    email: normalizedEmail,
    purpose,
  });

  const otp = generateOtp();

  const otpHash = await bcrypt.hash(
    otp,
    10,
  );

  await AuthOtp.create({
    email: normalizedEmail,
    otpHash,
    purpose,
    expiresAt: new Date(
      Date.now() + OTP_TTL_MS,
    ),
    attempts: 0,
  });

  await sendOtpEmail(
    normalizedEmail,
    otp,
    purpose,
  );
}

export async function verifyOtp(
  email: string,
  otp: string,
  purpose:
    | "REGISTER"
    | "LOGIN"
    | "FORGOT_PASSWORD",
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const record = await AuthOtp.findOne({
    email: normalizedEmail,
    purpose,
  });

  if (!record) {
    throw new Error(
      "OTP expired or not requested.",
    );
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await record.deleteOne();
    throw new Error("OTP has expired.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne();
    throw new Error(
      "Too many incorrect OTP attempts.",
    );
  }

  const valid = await bcrypt.compare(
    otp,
    record.otpHash,
  );

  if (!valid) {
    record.attempts += 1;
    await record.save();

    throw new Error("Invalid OTP.");
  }

  await record.deleteOne();

  return true;
}
