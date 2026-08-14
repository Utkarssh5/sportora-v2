import { z } from "zod";

export const registerUserSchema = z.object({
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
    .min(10)
    .max(15)
    .optional(),

  role: z.enum([
    "PLAYER",
    "ORGANIZER",
    "ADMIN",
    "REFEREE",
    "UMPIRE",
    "VOLUNTEER",
    "SPONSOR",
  ]).optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;