import { z } from "zod";
import {
  SupportCategory,
  SupportPriority,
} from "../models/support-ticket.model.js";

export const createSupportTicketSchema = z.object({
  category: z.enum([
    SupportCategory.TOURNAMENT,
    SupportCategory.ORGANIZER,
    SupportCategory.ACCOUNT,
  ]),
  subject: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(2000),
  priority: z
    .enum([
      SupportPriority.LOW,
      SupportPriority.MEDIUM,
      SupportPriority.HIGH,
    ])
    .optional(),

  tournamentId: z.string().trim().optional(),
  registrationId: z.string().trim().optional(),
});
