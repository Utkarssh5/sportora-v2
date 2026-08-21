import mongoose from "mongoose";
import {
  SupportPriority,
  SupportStatus,
  SupportTicket,
} from "../models/support-ticket.model.js";
import { TournamentRegistration } from "../../tournamentRegistration/models/tournamentRegistration.model.js";
import { PaymentRepository } from "../../payment/repositories/payment.repository.js";

const paymentRepository = new PaymentRepository();

interface CreateSupportTicketInput {
  userId: string;
  category: "TOURNAMENT" | "ORGANIZER" | "ACCOUNT";
  subject: string;
  description: string;
  priority?: SupportPriority;
  tournamentId?: string;
  registrationId?: string;
}

export class SupportTicketService {
  async createTicket(input: CreateSupportTicketInput) {
    let tournamentId: string | null = null;
    let registrationId: string | null = null;

    if (input.registrationId) {
      if (!mongoose.isValidObjectId(input.registrationId)) {
        const error = new Error("Invalid registration ID.");
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      const registration =
        await TournamentRegistration.findOne({
          _id: input.registrationId,
          userId: input.userId,
        });

      if (!registration) {
        const error = new Error(
          "Registration not found for the current user.",
        );
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      if (
        input.tournamentId &&
        registration.tournamentId.toString() !== input.tournamentId
      ) {
        const error = new Error(
          "Registration does not belong to the selected tournament.",
        );
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      tournamentId = registration.tournamentId.toString();
      registrationId = registration._id.toString();
    } else if (input.tournamentId) {
      if (!mongoose.isValidObjectId(input.tournamentId)) {
        const error = new Error("Invalid tournament ID.");
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      const registration =
        await TournamentRegistration.findOne({
          tournamentId: input.tournamentId,
          userId: input.userId,
        });

      if (!registration) {
        const error = new Error(
          "Selected tournament is not linked to the current user.",
        );
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }

      tournamentId = input.tournamentId;
      registrationId = registration._id.toString();
    }

    return SupportTicket.create({
      userId: input.userId,
      category: input.category,
      subject: input.subject,
      description: input.description,
      priority: input.priority ?? SupportPriority.MEDIUM,
      tournamentId,
      registrationId,
    });
  }

  async getUserTickets(userId: string) {
    return SupportTicket.find({ userId }).sort({ createdAt: -1 });
  }

  async updateTicket(
    ticketId: string,
    input: {
      status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      adminResponse?: string | null;
    },
  ) {
    const existingTicket = await SupportTicket.findById(ticketId);

    if (!existingTicket) {
      return null;
    }

    if (
      input.status !== undefined &&
      input.status !== existingTicket.status
    ) {
      const allowedTransitions: Record<SupportStatus, SupportStatus[]> = {
        [SupportStatus.OPEN]: [
          SupportStatus.IN_PROGRESS,
        ],
        [SupportStatus.IN_PROGRESS]: [
          SupportStatus.OPEN,
          SupportStatus.RESOLVED,
        ],
        [SupportStatus.RESOLVED]: [
          SupportStatus.IN_PROGRESS,
          SupportStatus.CLOSED,
        ],
        [SupportStatus.CLOSED]: [],
      };

      const allowed = allowedTransitions[
        existingTicket.status as SupportStatus
      ];

      if (!allowed.includes(input.status as SupportStatus)) {
        const error = new Error(
          `Invalid support ticket status transition: ${existingTicket.status} → ${input.status}`,
        );
        (error as Error & { statusCode?: number }).statusCode = 400;
        throw error;
      }
    }

    return SupportTicket.findByIdAndUpdate(
      ticketId,
      {
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.adminResponse !== undefined && {
          adminResponse: input.adminResponse,
        }),
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("userId", "fullName email")
      .populate(
        "tournamentId",
        "title sport city state locationName status",
      )
      .populate(
        "registrationId",
        "status ticketId registeredAt",
      );
  }

  async getAllTickets(filters?: {
    status?: string;
    category?: string;
    priority?: string;
  }) {
    const query: Record<string, string> = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.category) query.category = filters.category;
    if (filters?.priority) query.priority = filters.priority;

    const tickets = await SupportTicket.find(query)
      .populate("userId", "fullName email")
      .populate(
        "tournamentId",
        "title sport city state locationName status",
      )
      .populate(
        "registrationId",
        "status ticketId registeredAt",
      )
      .sort({ createdAt: -1 });

    return Promise.all(
      tickets.map(async (ticket) => {
        const ticketObject = ticket.toObject();

        let payment = null;

        if (
          ticket.tournamentId &&
          ticket.userId
        ) {
          const tournamentId =
            typeof ticket.tournamentId === "object" &&
            "_id" in ticket.tournamentId
              ? String(ticket.tournamentId._id)
              : String(ticket.tournamentId);

          const userId =
            typeof ticket.userId === "object" &&
            "_id" in ticket.userId
              ? String(ticket.userId._id)
              : String(ticket.userId);

          payment = await paymentRepository.findByTournamentAndUser(
            tournamentId,
            userId,
          );
        }

        return {
          ...ticketObject,
          paymentContext: payment
            ? {
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                orderId: payment.orderId,
                paymentId: payment.paymentId ?? null,
              }
            : null,
        };
      }),
    );
  }
}

export const supportTicketService = new SupportTicketService();
