import {
  CrewSettlementModel,
} from "../models/crew-settlement.model.js";

class CrewSettlementRepository {
  async findByAssignmentId(assignmentId: string) {
    return CrewSettlementModel.findOne({
      assignmentId,
    });
  }

  async findById(settlementId: string) {
    return CrewSettlementModel.findById(
      settlementId
    );
  }

  async create(data: {
    assignmentId: string;
    tournamentId: string;
    crewId: string;
    amount?: number;
    currency?: string;
    verifiedAt: Date;
    provider?: string;
  }) {
    return CrewSettlementModel.create({
      assignmentId: data.assignmentId,
      tournamentId: data.tournamentId,
      crewId: data.crewId,
      amount: data.amount,
      currency: data.currency ?? "INR",
      verifiedAt: data.verifiedAt,
      provider: data.provider ?? "DEMO",
      status: "PENDING",
    });
  }

  async findByCrewId(crewId: string) {
    return CrewSettlementModel.find({
      crewId,
    }).sort({
      createdAt: -1,
    });
  }

  async updateStatus(
    settlementId: string,
    update: Record<string, unknown>
  ) {
    return CrewSettlementModel.findByIdAndUpdate(
      settlementId,
      update,
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

export const crewSettlementRepository =
  new CrewSettlementRepository();
