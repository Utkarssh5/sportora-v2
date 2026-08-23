import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findTournamentById: vi.fn(),
  findAssignmentById: vi.fn(),
  updateStatus: vi.fn(),
  findCrewById: vi.fn(),
  findAssignmentByTournamentAndCrew: vi.fn(),
  createAssignment: vi.fn(),
  findRegisteredByUserWithTournaments: vi.fn(),
  createSettlement: vi.fn(),
  createAchievement: vi.fn(),
}));

vi.mock("../../repositories/tournament.repository.js", () => ({
  tournamentRepository: {
    findById: mocks.findTournamentById,
  },
}));

vi.mock("../../repositories/tournament-crew-assignment.repository.js", () => ({
  tournamentCrewAssignmentRepository: {
    findById: mocks.findAssignmentById,
    findByTournamentAndCrew: mocks.findAssignmentByTournamentAndCrew,
    create: mocks.createAssignment,
    updateStatus: mocks.updateStatus,
  },
}));

vi.mock("../../../crew/models/crew.model.js", () => ({
  CrewModel: {
    findById: mocks.findCrewById,
  },
}));

vi.mock("../../../tournamentRegistration/repositories/tournamentRegistration.repository.js", () => ({
  tournamentRegistrationRepository: {
    findRegisteredByUserWithTournaments:
      mocks.findRegisteredByUserWithTournaments,
  },
}));

vi.mock("../../../crewSettlement/services/crew-settlement.service.js", () => ({
  crewSettlementService: {
    createForVerifiedAssignment: mocks.createSettlement,
  },
}));

vi.mock("../../../crewAchievements/services/ground-crew-achievement.service.js", () => ({
  groundCrewAchievementService: {
    createForVerifiedAssignment: mocks.createAchievement,
  },
}));

import { tournamentCrewAssignmentService } from "../tournament-crew-assignment.service.js";

const organizer = {
  id: "organizer-1",
  role: "ORGANIZER",
};

const crewUser = {
  id: "crew-user-1",
  role: "PLAYER",
};

const tournament = {
  _id: "tournament-1",
  organizerId: {
    toString: () => "organizer-1",
  },
  status: "APPROVED",
  startDate: new Date("2026-09-20T00:00:00.000Z"),
  endDate: new Date("2026-09-21T23:59:59.999Z"),
};

const crew = {
  _id: "crew-1",
  userId: {
    toString: () => "crew-user-1",
  },
  isAvailable: true,
};

describe("TournamentCrewAssignmentService crew lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.updateStatus.mockImplementation(
      async (_assignmentId, update) => update
    );

    mocks.createSettlement.mockResolvedValue({
      id: "settlement-1",
    });

    mocks.createAchievement.mockResolvedValue({
      id: "achievement-1",
    });

    mocks.createAchievement.mockResolvedValue({
      id: "achievement-1",
    });
  });

  it("starts an assigned crew assignment", async () => {
    const assignment = {
      _id: "507f1f77bcf86cd799439011",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "ASSIGNED",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findCrewById.mockResolvedValue(crew);

    const result =
      await tournamentCrewAssignmentService.startWork(
        "assignment-1",
        crewUser
      );

    expect(mocks.updateStatus).toHaveBeenCalledWith(
      "assignment-1",
      expect.objectContaining({
        status: "WORKING",
        workStartedAt: expect.any(Date),
      })
    );

    expect(result?.status).toBe("WORKING");
  });

  it("submits completion for working crew with proof and note", async () => {
    const assignment = {
      _id: "assignment-1",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "WORKING",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findCrewById.mockResolvedValue(crew);

    const result =
      await tournamentCrewAssignmentService.submitCompletion(
        "assignment-1",
        {
          completionProof: [
            "https://example.com/proof.jpg",
            "   ",
            "https://example.com/report.pdf",
          ],
          completionNote: "Event completed successfully.",
        },
        crewUser
      );

    expect(mocks.updateStatus).toHaveBeenCalledWith(
      "assignment-1",
      expect.objectContaining({
        status: "COMPLETION_SUBMITTED",
        completionProof: [
          "https://example.com/proof.jpg",
          "https://example.com/report.pdf",
        ],
        completionNote: "Event completed successfully.",
        workCompletedAt: expect.any(Date),
      })
    );

    expect(result?.status).toBe("COMPLETION_SUBMITTED");
  });

  it("allows the tournament owner to verify submitted crew work", async () => {
    const assignment = {
      _id: "507f1f77bcf86cd799439011",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "COMPLETION_SUBMITTED",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findTournamentById.mockResolvedValue(tournament);
    mocks.findCrewById.mockResolvedValue(crew);
    mocks.updateStatus.mockResolvedValue({
      ...assignment,
      status: "PAYOUT_PENDING",
      verifiedAt: new Date(),
      verifiedBy: "organizer-1",
    });
    mocks.createSettlement.mockResolvedValue({
      id: "settlement-1",
    });
    mocks.createAchievement.mockResolvedValue({
      id: "achievement-1",
    });


    const result =
      await tournamentCrewAssignmentService.verifyCompletion(
        "507f1f77bcf86cd799439011",
        organizer
      );


    expect(mocks.updateStatus).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      expect.objectContaining({
        status: "PAYOUT_PENDING",
        verifiedAt: expect.any(Date),
        verifiedBy: "organizer-1",
      })
    );

    expect(result?.status).toBe("PAYOUT_PENDING");
  });

  it("does not allow another crew member to start the assignment", async () => {
    const assignment = {
      _id: "assignment-1",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "ASSIGNED",
    };

    const anotherCrewUser = {
      id: "different-user",
      role: "PLAYER",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findCrewById.mockResolvedValue(crew);

    await expect(
      tournamentCrewAssignmentService.startWork(
        "assignment-1",
        anotherCrewUser
      )
    ).rejects.toThrow(
      "You do not have permission to start this crew assignment."
    );

    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });

  it("does not allow an organizer to verify incomplete work", async () => {
    const assignment = {
      _id: "assignment-1",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "WORKING",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findTournamentById.mockResolvedValue(tournament);

    await expect(
      tournamentCrewAssignmentService.verifyCompletion(
        "assignment-1",
        organizer
      )
    ).rejects.toThrow(
      "Only submitted crew work can be verified."
    );

    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });

  it("blocks crew assignment when the crew user is a player on overlapping tournament dates", async () => {
    mocks.findTournamentById.mockResolvedValue(tournament);
    mocks.findCrewById.mockResolvedValue(crew);
    mocks.findRegisteredByUserWithTournaments.mockResolvedValue([
      {
        tournamentId: {
          startDate: new Date("2026-09-20T00:00:00.000Z"),
          endDate: new Date("2026-09-21T23:59:59.999Z"),
        },
      },
    ]);

    await expect(
      tournamentCrewAssignmentService.assignCrew(
        "tournament-1",
        "crew-1",
        organizer
      )
    ).rejects.toThrow(
      "Crew member is already registered as a player in a tournament with overlapping dates."
    );

    expect(mocks.createAssignment).not.toHaveBeenCalled();
  });

  it("allows crew assignment when the crew user's player tournament has different dates", async () => {
    mocks.findTournamentById.mockResolvedValue(tournament);
    mocks.findCrewById.mockResolvedValue(crew);
    mocks.findRegisteredByUserWithTournaments.mockResolvedValue([
      {
        tournamentId: {
          startDate: new Date("2026-09-25T00:00:00.000Z"),
          endDate: new Date("2026-09-26T23:59:59.999Z"),
        },
      },
    ]);
    mocks.findAssignmentByTournamentAndCrew.mockResolvedValue(null);
    mocks.createAssignment.mockResolvedValue({
      _id: "assignment-1",
      status: "ASSIGNED",
    });

    const result =
      await tournamentCrewAssignmentService.assignCrew(
        "tournament-1",
        "crew-1",
        organizer
      );

    expect(mocks.createAssignment).toHaveBeenCalledWith(
      "tournament-1",
      "crew-1",
      expect.objectContaining({
        eventDate: tournament.startDate,
      })
    );
    expect(result?.status).toBe("ASSIGNED");
  });

  it("allows crew assignment when the previous player registration is cancelled", async () => {
    mocks.findTournamentById.mockResolvedValue(tournament);
    mocks.findCrewById.mockResolvedValue(crew);
    mocks.findRegisteredByUserWithTournaments.mockResolvedValue([]);
    mocks.findAssignmentByTournamentAndCrew.mockResolvedValue(null);
    mocks.createAssignment.mockResolvedValue({
      _id: "assignment-1",
      status: "ASSIGNED",
    });

    const result =
      await tournamentCrewAssignmentService.assignCrew(
        "tournament-1",
        "crew-1",
        organizer
      );

    expect(mocks.createAssignment).toHaveBeenCalled();
    expect(result?.status).toBe("ASSIGNED");
  });

  it("does not allow a crew member to submit completion before starting work", async () => {
    const assignment = {
      _id: "assignment-1",
      tournamentId: "tournament-1",
      crewId: "crew-1",
      status: "ASSIGNED",
    };

    mocks.findAssignmentById.mockResolvedValue(assignment);
    mocks.findCrewById.mockResolvedValue(crew);

    await expect(
      tournamentCrewAssignmentService.submitCompletion(
        "assignment-1",
        {
          completionNote: "Trying to submit early.",
        },
        crewUser
      )
    ).rejects.toThrow(
      "Work completion can only be submitted for an active assignment."
    );

    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });
});
