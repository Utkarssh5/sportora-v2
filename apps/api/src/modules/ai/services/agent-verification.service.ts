import type {
  AgentContext,
  AgentGoal,
  AgentToolResult,
} from "../types.js";

import { paymentRepository } from "../../payment/repositories/payment.repository.js";
import {
  tournamentRegistrationRepository,
} from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";

import {
  PaymentStatus,
} from "../../payment/models/payment.model.js";

import {
  RegistrationStatus,
} from "../../tournamentRegistration/models/tournamentRegistration.model.js";

export interface AgentVerificationResult {
  verified: boolean;
  reason: string;
}

export class AgentVerificationService {
  public static async verifyGoal(
    goal: AgentGoal,
    _toolName: string,
    result: AgentToolResult,
    _context: AgentContext
  ): Promise<AgentVerificationResult> {
    if (!result.success) {
      return {
        verified: false,
        reason:
          result.message ??
          "The tool operation failed.",
      };
    }

    switch (goal.type) {
      case "DISCOVER_TOURNAMENT":
        return this.verifyTournamentDiscovery(result);

      case "VIEW_TOURNAMENT":
        return this.verifyTournamentView(result);

      case "CHECK_REGISTRATIONS":
        return this.verifyRegistrations(result);

      case "CANCEL_REGISTRATION":
        return this.verifyCancellation(result);

      case "VIEW_PROFILE":
        return {
          verified: result.data != null,
          reason:
            result.data != null
              ? "Player profile returned by the backend."
              : "Player profile was not returned by the backend.",
        };

      case "CHECK_MATCH":
        return {
          verified: result.data != null,
          reason:
            result.data != null
              ? "Match information returned by the backend."
              : "Match information was not returned by the backend.",
        };

      case "REGISTER_TOURNAMENT":
        return this.verifyTournamentRegistration(
          result,
          _context
        );

      case "PAYMENT":
        return this.verifyPayment(
          result,
          _context
        );

      default:
        return {
          verified: false,
          reason:
            `No deterministic verifier exists for ${goal.type}.`,
        };
    }
  }

  private static verifyTournamentDiscovery(
    result: AgentToolResult
  ): AgentVerificationResult {
    const data = result.data as any;

    if (!Array.isArray(data?.tournaments)) {
      return {
        verified: false,
        reason:
          "Tournament discovery returned no verifiable tournament list.",
      };
    }

    return {
      verified: true,
      reason:
        "Tournament discovery returned a verified tournament list.",
    };
  }

  private static verifyTournamentView(
    result: AgentToolResult
  ): AgentVerificationResult {
    const data = result.data as any;

    if (!(data?.tournament ?? data)) {
      return {
        verified: false,
        reason:
          "Tournament details were not returned by the backend.",
      };
    }

    return {
      verified: true,
      reason:
        "Tournament details were returned by the backend.",
    };
  }

  private static verifyRegistrations(
    result: AgentToolResult
  ): AgentVerificationResult {
    if (result.data == null) {
      return {
        verified: false,
        reason:
          "Registration state was not returned by the backend.",
      };
    }

    return {
      verified: true,
      reason:
        "Registration state was returned by the backend.",
    };
  }

  private static async verifyTournamentRegistration(
    result: AgentToolResult,
    context: AgentContext
  ): Promise<AgentVerificationResult> {
    const data = result.data as {
      tournamentId?: string;
      registrationId?: string;
      paymentRequired?: boolean;
      confirmationRequired?: boolean;
    } | null | undefined;

    /*
     * A paid registration request only establishes that payment
     * is required. It does not establish registration.
     */
    if (
      data?.paymentRequired === true ||
      data?.confirmationRequired === true
    ) {
      return {
        verified: false,
        reason:
          "Payment is required before tournament registration can be verified.",
      };
    }

    const registrationId =
      data?.registrationId;

    if (registrationId) {
      const registration =
        await tournamentRegistrationRepository
          .findForVerification(registrationId);

      if (
        registration &&
        registration.userId &&
        registration.status ===
          RegistrationStatus.REGISTERED &&
        registration.ticketId
      ) {
        return {
          verified: true,
          reason:
            "Backend verified the registered tournament and ticket.",
        };
      }

      return {
        verified: false,
        reason:
          "Backend could not verify a registered tournament with a ticket.",
      };
    }

    if (!data?.tournamentId) {
      return {
        verified: false,
        reason:
          "Tournament registration result did not contain a tournament reference.",
      };
    }

    const registration =
      await tournamentRegistrationRepository
        .findByTournamentAndUser(
          data.tournamentId,
          context.user.id
        );

    if (
      registration &&
      registration.status ===
        RegistrationStatus.REGISTERED &&
      registration.ticketId
    ) {
      return {
        verified: true,
        reason:
          "Backend verified the registered tournament and ticket.",
      };
    }

    return {
      verified: false,
      reason:
        "Backend has not verified a registered tournament with a ticket.",
    };
  }

  private static async verifyPayment(
    result: AgentToolResult,
    context: AgentContext
  ): Promise<AgentVerificationResult> {
    const data = result.data as {
      orderId?: string;
      paymentId?: string;
    } | null | undefined;

    if (!data?.orderId) {
      return {
        verified: false,
        reason:
          "Payment result did not contain an order reference.",
      };
    }

    const payment =
      await paymentRepository.findByOrderId(
        data.orderId
      );

    if (!payment) {
      return {
        verified: false,
        reason:
          "Backend could not find the payment order.",
      };
    }

    if (
      payment.userId.toString() !==
      context.user.id
    ) {
      return {
        verified: false,
        reason:
          "Payment belongs to a different player.",
      };
    }

    if (
      payment.status !== PaymentStatus.SUCCESS
    ) {
      return {
        verified: false,
        reason:
          "Payment order exists, but backend has not verified a successful payment.",
      };
    }

    if (!payment.paymentId) {
      return {
        verified: false,
        reason:
          "Payment is marked successful but has no verified payment ID.",
      };
    }

    return {
      verified: true,
      reason:
        "Backend verified the payment as SUCCESS.",
    };
  }

  private static verifyCancellation(
    result: AgentToolResult
  ): AgentVerificationResult {
    const data = result.data as any;

    if (
      data?.success === false ||
      data?.cancelled === false
    ) {
      return {
        verified: false,
        reason:
          "The backend did not verify registration cancellation.",
      };
    }

    return {
      verified: true,
      reason:
        "The backend verified registration cancellation.",
    };
  }
}

export const agentVerificationService =
  AgentVerificationService;
