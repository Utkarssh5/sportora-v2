import { z } from "zod";

export const submitVenueProofSchema = z
  .object({
    venueName: z
      .string()
      .min(3, "Venue name is required")
      .max(200),

    venueAddress: z
      .string()
      .min(10, "Complete venue address is required")
      .max(500),

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

    venueType: z.enum([
      "GOVERNMENT_SPORTS_CENTRE",
      "PRIVATE_SPORTS_COMPLEX",
      "SPORTS_ACADEMY",
      "SCHOOL_COLLEGE",
      "SPORTS_CLUB",
      "OTHER",
    ]),

    bookingStatus: z.enum([
      "BOOKED",
      "NOT_BOOKED_YET",
    ]),

    proofType: z.enum([
      "BOOKING_RECEIPT",
      "PERMISSION_LETTER",
      "AGREEMENT",
      "INVOICE_PAYMENT_RECEIPT",
      "GOVERNMENT_ALLOCATION",
      "VENUE_CONFIRMATION",
      "QUOTATION",
      "OTHER",
    ]),

    venueContactName: z
      .string()
      .max(100)
      .optional(),

    venueContactPhone: z
      .string()
      .regex(/^[0-9]{10,15}$/, "Venue contact phone is invalid")
      .optional()
      .or(z.literal("")),

    expectedBookingDate: z
      .string()
      .optional()
      .or(z.literal("")),

    venueCommunication: z
      .string()
      .max(1000)
      .optional()
      .or(z.literal("")),

    venuePhotos: z
      .array(z.string().url("Venue photo must be a valid URL"))
      .min(1, "At least one venue photo is required")
      .default([]),

    venueVideos: z
      .array(z.string().url("Venue video must be a valid URL"))
      .default([]),

    permissionDocs: z
      .array(z.string().url("Permission document must be a valid URL"))
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.bookingStatus === "BOOKED") {
      if (data.permissionDocs.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["permissionDocs"],
          message:
            "Booking or permission proof is required when the venue is already booked.",
        });
      }
    }

    if (data.bookingStatus === "NOT_BOOKED_YET") {
      if (!data.expectedBookingDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expectedBookingDate"],
          message:
            "Expected booking date is required when the venue is not booked yet.",
        });
      }

      if (!data.venueCommunication?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["venueCommunication"],
          message:
            "Explain the venue communication or booking plan.",
        });
      }
    }

    if (
      data.expectedBookingDate &&
      Number.isNaN(new Date(data.expectedBookingDate).getTime())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expectedBookingDate"],
        message: "Expected booking date is invalid.",
      });
    }
  });

export type SubmitVenueProofInput =
  z.infer<typeof submitVenueProofSchema>;
