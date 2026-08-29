import { z } from "zod";

const baseRegisterSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is invalid")
    .optional(),

  role: z.enum([
    "PLAYER",
    "ORGANIZER",
  ]).optional(),

  organizationName: z.string().max(150).optional(),
  governmentIdType: z.string().max(50).optional(),
  governmentId: z.string().max(100).optional(),
  documentUrl: z.string().url().optional(),

  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().optional(),
});

export const registerSchema = baseRegisterSchema.superRefine(
  (data, ctx) => {
    if (data.role !== "ORGANIZER") {
      return;
    }

    if (!data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone number is required for organizers",
      });
    }

    if (!data.organizationName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationName"],
        message: "Organization name is required",
      });
    }

    if (!data.governmentIdType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governmentIdType"],
        message: "Government ID type is required",
      });
    }

    if (!data.governmentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governmentId"],
        message: "Government ID is required",
      });
    }

    if (!data.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Complete address is required",
      });
    }

    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["city"],
        message: "City is required",
      });
    }

    if (!data.state) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "State is required",
      });
    }

  }
);

export type RegisterInput = z.infer<typeof registerSchema>;
