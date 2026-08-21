import {
  crewSettlementRepository,
} from "../repositories/crew-settlement.repository.js";
import {
  tournamentCrewAssignmentRepository,
} from "../../tournaments/repositories/tournament-crew-assignment.repository.js";

export class CrewSettlementService {
  async createForVerifiedAssignment(data: {
    assignmentId: string;
    tournamentId: string;
    crewId: string;
    amount?: number;
    verifiedAt: Date;
  }) {
    const existing =
      await crewSettlementRepository.findByAssignmentId(
        data.assignmentId
      );

    if (existing) {
      return existing;
    }

    const settlementData = {
      assignmentId: data.assignmentId,
      tournamentId: data.tournamentId,
      crewId: data.crewId,
      verifiedAt: data.verifiedAt,
      provider: "DEMO",
      ...(data.amount !== undefined
        ? { amount: data.amount }
        : {}),
    };

    return crewSettlementRepository.create(
      settlementData
    );
  }

  async markDemoPaid(settlementId: string) {
    const settlement =
      await crewSettlementRepository.findById(
        settlementId
      );

    if (!settlement) {
      throw new Error("Settlement not found.");
    }

    if (settlement.status !== "PENDING") {
      throw new Error(
        "Only pending settlements can be marked as paid."
      );
    }

    const paidAt = new Date();
    const providerReference =
      `DEMO-${Date.now()}`;

    const updatedSettlement =
      await crewSettlementRepository.updateStatus(
        settlementId,
        {
          status: "PAID",
          paidAt,
          provider: "DEMO",
          providerReference,
        }
      );

    if (!updatedSettlement) {
      throw new Error("Settlement could not be updated.");
    }

    await tournamentCrewAssignmentRepository.updateStatus(
      settlement.assignmentId.toString(),
      {
        status: "PAID",
      }
    );

    return updatedSettlement;
  }

  async getByCrewId(crewId: string) {
    return crewSettlementRepository.findByCrewId(
      crewId
    );
  }
}

export const crewSettlementService =
  new CrewSettlementService();
