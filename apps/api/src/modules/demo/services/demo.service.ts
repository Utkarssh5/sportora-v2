import bcrypt from "bcrypt";

import { User } from "../../users/models/user.model.js";
import { UserRole } from "../../users/models/user.model.js";

import { TournamentModel } from "../../tournaments/models/tournament.model.js";
import { TournamentStatus } from "../../tournaments/models/tournament.model.js";
import { TournamentType } from "../../tournaments/models/tournament.model.js";

import { TournamentRegistration } from "../../tournamentRegistration/models/tournamentRegistration.model.js";

import { matchRepository } from "../../match/repositories/match.repository.js";
import { MatchStatus } from "../../match/models/match.model.js";
import { matchService } from "../../match/services/match.service.js";
import { fixtureService } from "../../match/services/fixture.service.js";
import { competitionEntryService } from "../../competitionEntry/services/competitionEntry.service.js";
import { OrganizerVerification, VerificationStatus } from "../../organizerVerification/models/organizerVerification.model.js";
import { VenueVerification, VenueVerificationStatus } from "../../venueVerification/models/venueVerification.model.js";

const DEMO_EMAIL_PREFIX = "sportora.qa.";

const DEMO_PLAYER_EMAILS = [
  "sportora.qa.player01@sportora.test",
  "sportora.qa.player02@sportora.test",
  "sportora.qa.player03@sportora.test",
  "sportora.qa.player04@sportora.test",
  "sportora.qa.player05@sportora.test",
  "sportora.qa.player06@sportora.test",
  "sportora.qa.player07@sportora.test",
  "sportora.qa.player08@sportora.test",
  "sportora.qa.player09@sportora.test",
  "sportora.qa.player10@sportora.test",
];

const DEMO_ORGANIZER_EMAIL =
  "sportora.qa.organizer@sportora.test";

export class DemoService {
  async createDemoTournament(currentUserId: string) {
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      throw new Error("Current user not found.");
    }

    /*
     * If a PLAYER creates the demo, preserve that real player
     * as participant #1 so completed QA matches can affect
     * the real profile.
     *
     * ORGANIZER/ADMIN users must never become participants.
     */
    const participants =
      currentUser.role === UserRole.PLAYER
        ? [currentUser]
        : [];

    /*
     * Create/reuse dedicated QA players until the tournament
     * always has exactly 10 individual participants.
     */
    const requiredQaPlayers =
      10 - participants.length;

    for (
      let i = 0;
      i < requiredQaPlayers;
      i++
    ) {
      const email = DEMO_PLAYER_EMAILS[i];

      if (!email) {
        throw new Error(
          "Demo QA player configuration is incomplete."
        );
      }

      let player = await User.findOne({ email });

      if (!player) {
        const password = await bcrypt.hash(
          `SportoraQA@${i + 1}2026`,
          10
        );

        player = await User.create({
          fullName: `Sportora QA Player ${String(i + 1).padStart(2, "0")}`,
          email,
          password,
          role: UserRole.PLAYER,
          isVerified: true,
          city: "Jaipur",
          state: "Rajasthan",
          profileImage: "",
          bio: "Sportora QA demo player",
          interests: ["Football"],
          achievements: [],
        });
      }

      participants.push(player);
    }

    /*
     * Create/reuse dedicated QA organizer.
     *
     * Demo creation intentionally bypasses the normal
     * organizer verification + AI screening pipeline.
     * This route is development-only.
     */
    let organizer = await User.findOne({
      email: DEMO_ORGANIZER_EMAIL,
    });

    if (!organizer) {
      const password = await bcrypt.hash(
        "SportoraQAOrganizer@2026",
        10
      );

      organizer = await User.create({
        fullName: "Sportora QA Organizer",
        email: DEMO_ORGANIZER_EMAIL,
        password,
        role: UserRole.ORGANIZER,
        isVerified: true,
        city: "Jaipur",
        state: "Rajasthan",
        profileImage: "",
        bio: "Sportora QA demo organizer",
        interests: ["Football"],
        achievements: [],
      });
    }

    /*
     * Demo organizers intentionally bypass the normal organizer
     * verification pipeline, but the organizer portal still expects
     * a verification record. Ensure the dedicated QA organizer has
     * an approved demo verification record.
     */
    await OrganizerVerification.findOneAndUpdate(
      { organizer: organizer._id },
      {
        organizer: organizer._id,
        organizationName: "Sportora QA Demo Sports",
        governmentIdType: "DEMO",
        governmentId: "SPORTORA-QA-DEMO",
        documentUrl: "https://example.com/sportora-qa-demo-id.pdf",
        address: "Sportora QA Demo Ground, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
        status: VerificationStatus.APPROVED,
        remarks: "Dedicated Sportora QA demo organizer verification.",
        reviewedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    /*
     * Prevent accidental duplicate demo tournaments.
     */
    const existingDemo =
      await TournamentModel.findOne({
        title: "SPORTORA QA — Jaipur Demo Championship",
      });

    if (existingDemo) {
      throw new Error(
        `Demo tournament already exists: ${existingDemo._id}`
      );
    }

    const now = new Date();

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 7);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    /*
     * Demo registrations are created immediately, so the QA
     * tournament must already be past its registration deadline.
     * The production fixture engine remains responsible for
     * enforcing the real deadline in production tournaments.
     */
    const registrationDeadline = new Date(now);
    registrationDeadline.setMinutes(
      registrationDeadline.getMinutes() - 1
    );

    const tournament = await TournamentModel.create({
      organizerId: organizer._id,

      title:
        "SPORTORA QA — Jaipur Demo Championship",

      sport: "Football",

      /*
       * Current fixture engine supports single elimination.
       * Do not advertise unsupported formats here.
       */
      format: "KNOCKOUT",

      type: TournamentType.SOLO,
      competitionType: "SINGLES",
      competitionRules: {
        participantCount: 1,
        requiresRoster: false,
      },

      city: "Jaipur",
      state: "Rajasthan",
      locationName: "SKIT Sports Ground — QA Arena",
      pincode: "302017",

      venuePhotos: [],
      venueVideos: [],
      permissionDocs: [],

      startDate,
      endDate,
      registrationDeadline,

      maxParticipants: participants.length,
      registeredParticipants: participants.length,

      entryFee: 0,
      prizePool: 10000,

      sponsors: [],

      status: TournamentStatus.APPROVED,

      aiRiskScore: 0,
      aiRiskAnalysis:
        "Development QA tournament. AI screening bypassed intentionally.",
    });

    /*
     * Keep the QA tournament aligned with the venue verification
     * architecture used by the production tournament flow.
     */
    await VenueVerification.findOneAndUpdate(
      { tournament: tournament._id },
      {
        tournament: tournament._id,
        organizer: organizer._id,
        venueName: "SKIT Sports Ground — QA Arena",
        venueAddress: "SKIT Sports Ground — QA Arena, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302017",
        venuePhotos: [
          "https://example.com/sportora-qa-venue-photo.jpg",
        ],
        venueVideos: [],
        permissionDocs: [
          "https://example.com/sportora-qa-venue-permission.pdf",
        ],
        status: VenueVerificationStatus.APPROVED,
        remarks: "Dedicated Sportora QA demo venue verification.",
        reviewedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    /*
     * Create REAL registration documents.
     * Payment is intentionally not involved in Demo Lab.
     */
    const registrations = [];

    for (const participant of participants) {
      const registration =
        await TournamentRegistration.create({
          tournamentId: tournament._id,
          userId: participant._id,
          status: "REGISTERED",
          registeredAt: now,
        });

      registrations.push(registration);

      /*
       * Keep Demo Lab aligned with the real participation pipeline.
       * SINGLES entries are automatically APPROVED by
       * CompetitionEntryService.ensureForRegistration().
       */
      await competitionEntryService.ensureForRegistration({
        tournamentId: tournament._id.toString(),
        registrationId: registration._id.toString(),
        captainId: participant._id.toString(),
        competitionType: "SINGLES",
      });
    }

    return {
      tournament,
      organizer: {
        id: organizer._id,
        name: organizer.fullName,
        email: organizer.email,
      },
      participants: registrations.map(
        (registration) => ({
          registrationId: registration._id,
          userId: registration.userId,
        })
      ),
      totalParticipants: registrations.length,
    };
  }

  async generateFixtures(tournamentId: string) {
    return fixtureService.generateSingleElimination(
      tournamentId
    );
  }

  async simulateNextMatch(tournamentId: string) {
    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Demo tournament not found.");
    }

    if (tournament.title !== "SPORTORA QA — Jaipur Demo Championship") {
      throw new Error("This endpoint only works with the Sportora QA demo tournament.");
    }

    const matches = await matchRepository.findByTournament(tournamentId);

    const playableMatch = matches.find(
      (match: any) =>
        match.status === "SCHEDULED" &&
        match.teamA !== "TBD" &&
        match.teamB !== "TBD" &&
        match.teamA !== "BYE" &&
        match.teamB !== "BYE"
    );

    if (!playableMatch) {
      throw new Error("No playable match is currently available.");
    }

    /*
     * QA rule:
     * Keep the real current user (hippo) alive through
     * the bracket whenever he is present in the match.
     *
     * For other matches, teamA wins deterministically.
     */
    const currentPlayerId = "6a7ff85fe724ad6046e1aa40";

    const winner =
      playableMatch.teamA === currentPlayerId
        ? playableMatch.teamA
        : playableMatch.teamB === currentPlayerId
          ? playableMatch.teamB
          : playableMatch.teamA;

    const loser =
      winner === playableMatch.teamA
        ? playableMatch.teamB
        : playableMatch.teamA;

    const completedMatch = await matchService.updateScore(
      playableMatch._id.toString(),
      {
        scoreA: winner === playableMatch.teamA ? 2 : 1,
        scoreB: winner === playableMatch.teamB ? 2 : 1,
        status: MatchStatus.COMPLETED,
        winner,
      }
    );

    return {
      tournamentId,
      match: completedMatch,
      winner,
      loser,
      message: "Demo match simulated successfully.",
    };
  }

  async simulateAllMatches(tournamentId: string) {
    const tournament = await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Demo tournament not found.");
    }

    if (
      tournament.title !==
      "SPORTORA QA — Jaipur Demo Championship"
    ) {
      throw new Error(
        "This endpoint only works with the Sportora QA demo tournament."
      );
    }

    const simulatedMatches: any[] = [];
    const maxIterations = 50;

    for (let i = 0; i < maxIterations; i++) {
      const matches = await matchRepository.findByTournament(tournamentId);

      const playableMatch = matches.find(
        (match: any) =>
          match.status === "SCHEDULED" &&
          match.teamA !== "TBD" &&
          match.teamB !== "TBD" &&
          match.teamA !== "BYE" &&
          match.teamB !== "BYE"
      );

      if (!playableMatch) {
        break;
      }

      const currentPlayerId = "6a7ff85fe724ad6046e1aa40";

      const winner =
        playableMatch.teamA === currentPlayerId
          ? playableMatch.teamA
          : playableMatch.teamB === currentPlayerId
            ? playableMatch.teamB
            : playableMatch.teamA;

      const loser =
        winner === playableMatch.teamA
          ? playableMatch.teamB
          : playableMatch.teamA;

      const completedMatch = await matchService.updateScore(
        playableMatch._id.toString(),
        {
          scoreA: winner === playableMatch.teamA ? 2 : 1,
          scoreB: winner === playableMatch.teamB ? 2 : 1,
          status: MatchStatus.COMPLETED,
          winner,
        }
      );

      simulatedMatches.push({
        matchId: completedMatch._id.toString(),
        round: completedMatch.round,
        matchNumber: completedMatch.matchNumber,
        winner,
        loser,
        scoreA: completedMatch.scoreA,
        scoreB: completedMatch.scoreB,
      });
    }

    const finalMatch = await matchRepository.findByTournament(tournamentId);
    const completedFinal = finalMatch.find(
      (match: any) =>
        match.round === "FINAL" &&
        match.status === MatchStatus.COMPLETED
    );

    if (completedFinal?.winner) {
      tournament.status = TournamentStatus.COMPLETED;
      await tournament.save();
    }

    const allMatches = await matchRepository.findByTournament(tournamentId);

    const result = completedFinal?.winner
      ? {
          status: "COMPLETED",
          champion: completedFinal.winner,
          runnerUp:
            completedFinal.teamA === completedFinal.winner
              ? completedFinal.teamB
              : completedFinal.teamA,
          finalMatchId: completedFinal._id.toString(),
          finalScore: {
            scoreA: completedFinal.scoreA,
            scoreB: completedFinal.scoreB,
          },
        }
      : {
          status: tournament.status,
          champion: null,
          runnerUp: null,
          finalMatchId: null,
          finalScore: null,
        };

    return {
      tournamentId,
      simulatedCount: simulatedMatches.length,
      simulatedMatches,
      tournamentStatus: tournament.status,
      result,
      totalMatches: allMatches.length,
      completedMatches: allMatches.filter(
        (match: any) => match.status === MatchStatus.COMPLETED
      ).length,
    };
  }

  async getDemoTournament(tournamentId: string) {
    const tournament =
      await TournamentModel.findById(tournamentId);

    if (!tournament) {
      throw new Error("Demo tournament not found.");
    }

    if (
      tournament.title !==
      "SPORTORA QA — Jaipur Demo Championship"
    ) {
      throw new Error(
        "This endpoint only works with the Sportora QA demo tournament."
      );
    }

    const registrations =
      await TournamentRegistration.find({
        tournamentId,
      }).populate(
        "userId",
        "fullName email role"
      );

    const matches =
      await matchRepository.findByTournament(
        tournamentId
      );

    return {
      tournament,
      registrations,
      matches,
    };
  }

  async resetDemoTournament() {
    const tournaments =
      await TournamentModel.find({
        title:
          "SPORTORA QA — Jaipur Demo Championship",
      }).select("_id");

    const tournamentIds =
      tournaments.map(
        (tournament) => tournament._id
      );

    let deletedMatches = 0;
    let deletedRegistrations = 0;
    let deletedTournaments = 0;

    for (const tournamentId of tournamentIds) {
      const matches =
        await matchRepository.deleteByTournament(
          tournamentId.toString()
        );

      deletedMatches += matches.deletedCount;

      const registrations =
        await TournamentRegistration.deleteMany({
          tournamentId,
        });

      deletedRegistrations +=
        registrations.deletedCount;

      await VenueVerification.deleteMany({
        tournament: tournamentId,
      });

      const deleted =
        await TournamentModel.deleteOne({
          _id: tournamentId,
        });

      deletedTournaments +=
        deleted.deletedCount;
    }

    /*
     * Remove only dedicated QA users.
     * The current real user is NEVER deleted.
     */
    const qaPlayers =
      await User.deleteMany({
        email: {
          $regex: `^${DEMO_EMAIL_PREFIX}`,
          $ne: DEMO_ORGANIZER_EMAIL,
        },
      });

    const qaOrganizer =
      await User.deleteMany({
        email: {
          $regex: "^sportora\\.qa\\.organizer@",
        },
      });

    return {
      deletedTournaments,
      deletedRegistrations,
      deletedMatches,
      deletedQaPlayers:
        qaPlayers.deletedCount,
      deletedQaOrganizers:
        qaOrganizer.deletedCount,
    };
  }
}

export const demoService = new DemoService();
