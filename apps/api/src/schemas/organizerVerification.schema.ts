import { z } from "zod";

export const organizerVerificationSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(12, "Aadhaar number must be 12 digits")
    .max(12, "Aadhaar number must be 12 digits"),

  panNumber: z
    .string()
    .min(10, "PAN must be 10 characters")
    .max(10, "PAN must be 10 characters"),

  organizationName: z
    .string()
    .min(3, "Organization name is required"),

  organizationType: z
    .string()
    .min(2, "Organization type is required"),

  aadhaarFrontUrl: z
    .string()
    .url("Invalid Aadhaar Front URL"),

  aadhaarBackUrl: z
    .string()
    .url("Invalid Aadhaar Back URL"),

  panCardUrl: z
    .string()
    .url("Invalid PAN Card URL"),

  organizationCertificateUrl: z
    .string()
    .url("Invalid Certificate URL"),

  selfieUrl: z
    .string()
    .url("Invalid Selfie URL"),
});

export type OrganizerVerificationInput =
  z.infer<typeof organizerVerificationSchema>;