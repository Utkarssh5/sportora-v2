import { z } from "zod";

export const requestVerificationSchema = z.object({
  organizationName: z
    .string()
    .min(3, "Organization name is required"),

  governmentId: z
    .string()
    .min(5, "Government ID is required"),

  documentUrl: z
    .string()
    .url("Document URL must be valid"),
});

export type RequestVerificationInput =
  z.infer<typeof requestVerificationSchema>;