import nodemailer from "nodemailer";

const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration missing. Check apps/api/.env"
    );
  }

  return nodemailer.createTransport({
    host,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose:
    | "REGISTER"
    | "LOGIN"
    | "FORGOT_PASSWORD",
) {
  const transporter = getTransporter();

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  if (!from) {
    throw new Error(
      "SMTP_FROM/SMTP_USER is missing."
    );
  }

  const subject =
    purpose === "REGISTER"
      ? "Sportora registration verification OTP"
      : purpose === "LOGIN"
        ? "Sportora login verification OTP"
        : "Sportora password reset OTP";

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text: `Your Sportora OTP is ${otp}. It is valid for 1 minute. Do not share this OTP with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2>Sportora</h2>
        <p>Your verification OTP is:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px">
          ${otp}
        </div>
        <p>This OTP expires in <b>1 minute</b>.</p>
        <p style="color:#777">
          Do not share this OTP with anyone.
        </p>
      </div>
    `,
  });
}
