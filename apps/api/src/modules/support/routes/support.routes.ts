import { Router } from "express";
import { authMiddleware, authorize } from "../../../middleware/auth.middleware.js";
import {
  createSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  updateSupportTicket,
} from "../controllers/support-ticket.controller.js";

const router = Router();

router.post("/", authMiddleware, createSupportTicket);

router.get("/my", authMiddleware, getMySupportTickets);

router.get(
  "/admin",
  authMiddleware,
  authorize("ADMIN"),
  getAllSupportTickets,
);

router.patch(
  "/admin/:ticketId",
  authMiddleware,
  authorize("ADMIN"),
  updateSupportTicket,
);

export default router;
