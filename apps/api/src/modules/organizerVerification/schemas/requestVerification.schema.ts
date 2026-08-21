import { z } from "zod";

export const requestVerificationSchema = z.object({
  organizationName: z
    .string()
    .min(3, "Organization name is required")
    .max(150),

  governmentIdType: z
    .string()
    .min(2, "Government ID type is required")
    .max(50),

  governmentId: z
    .string()
    .min(5, "Government ID is required")
    .max(100),

  documentUrl: z
    .string()
    .url("Document URL must be valid"),

  address: z
    .string()
    .min(10, "Complete address is required")
    .max(300),

  city: z
    .string()
    .min(2, "City is required")
    .max(100),

  state: z
    .string()
    .min(2, "State is required")
    .max(100),

  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
});

export type RequestVerificationInput =
  z.infer<typeof requestVerificationSchema>;
