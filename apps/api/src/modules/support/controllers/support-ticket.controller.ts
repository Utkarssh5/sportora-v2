import type { Request, Response } from "express";
import { createSupportTicketSchema } from "../schemas/create-support-ticket.schema.js";
import { supportTicketService } from "../services/support-ticket.service.js";
import { SupportPriority } from "../models/support-ticket.model.js";

export const createSupportTicket = async (req: Request, res: Response) => {
  const parsed = createSupportTicketSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid support request.",
      errors: parsed.error.flatten(),
    });
  }

  const user = req.user as { id: string };
  const userId = user.id;

  try {
    const ticket = await supportTicketService.createTicket({
      userId,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority ?? SupportPriority.MEDIUM,
      ...(parsed.data.tournamentId
        ? { tournamentId: parsed.data.tournamentId }
        : {}),
      ...(parsed.data.registrationId
        ? { registrationId: parsed.data.registrationId }
        : {}),
    });

    return res.status(201).json({
    success: true,
    message: "Support request created successfully.",
      ticket,
    });
  } catch (error) {
    const statusCode =
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create support request.",
    });
  }
};

export const getMySupportTickets = async (req: Request, res: Response) => {
  const user = req.user as { id: string };
  const userId = user.id;

  const tickets = await supportTicketService.getUserTickets(userId);

  return res.status(200).json({
    success: true,
    tickets,
  });
};


export const getAllSupportTickets = async (req: Request, res: Response) => {
  const { status, category, priority } = req.query;

  const filters: {
    status?: string;
    category?: string;
    priority?: string;
  } = {};

  if (typeof status === "string") filters.status = status;
  if (typeof category === "string") filters.category = category;
  if (typeof priority === "string") filters.priority = priority;

  const tickets = await supportTicketService.getAllTickets(filters);

  return res.status(200).json({
    success: true,
    tickets,
  });
};


export const updateSupportTicket = async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  if (typeof ticketId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid support ticket ID.",
    });
  }

  const { status, priority, adminResponse } = req.body;

  try {
    const ticket = await supportTicketService.updateTicket(ticketId, {
      status,
      priority,
      adminResponse,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    const statusCode =
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update support ticket.",
    });
  }
};
