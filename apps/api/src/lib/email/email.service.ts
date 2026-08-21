import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const nodeEnv = process.env.NODE_ENV || "development";
const adminCenterUrl =
  process.env.SPORTORA_ADMIN_URL || "http://localhost:3000/admin";

const transporter =
  emailUser && emailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })
    : null;

export async function sendAdminWelcomeEmail(
  recipient: string,
  adminName: string,
  temporaryPassword: string,
) {
  const message = {
    recipient,
    adminName,
    temporaryPassword,
    adminCenterUrl,
  };

  if (nodeEnv !== "production") {
    console.log("\n📧 ===== SPORTORA DEV EMAIL =====");
    console.log(`To: ${message.recipient}`);
    console.log(`Subject: Welcome to Sportora Admin Center`);
    console.log(`Temporary Password: ${message.temporaryPassword}`);
    console.log(`Admin Center: ${message.adminCenterUrl}`);
    console.log("================================\n");

    return true;
  }

  if (!transporter || !emailUser) {
    throw new Error(
      "Admin email service is not configured for production.",
    );
  }

  await transporter.sendMail({
    from: `"Sportora Admin" <${emailUser}>`,
    to: recipient,
    subject: "Welcome to Sportora Admin Center",
    text: [
      `Hello ${adminName},`,
      "",
      "Your Sportora Admin account has been created.",
      "",
      `Login Email: ${recipient}`,
      `Temporary Password: ${temporaryPassword}`,
      "",
      `Admin Center: ${adminCenterUrl}`,
      "",
      "Please log in using the temporary password.",
      "You will be required to change your password on your first login.",
      "",
      "For security, do not share this temporary password.",
      "",
      "Sportora Team",
    ].join("\n"),
  });

  return true;
}
