import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository.js";
import type { RegisterUserInput } from "../schemas/user.schema.js";
import type { IUser } from "../models/user.model.js";
import { matchRepository } from "../../match/repositories/match.repository.js";
import { tournamentRegistrationRepository } from "../../tournamentRegistration/repositories/tournamentRegistration.repository.js";
import { TournamentStatus } from "../../tournaments/models/tournament.model.js";
import { User, UserRole } from "../models/user.model.js";
import { competitionEntryRepository } from "../../competitionEntry/repositories/competitionEntry.repository.js";
import { CrewModel } from "../../crew/models/crew.model.js";

export class UserService {
  async getById(id: string): Promise<IUser | null> {
    return userRepository.findById(id);
  }

  async updateProfile(
    id: string,
    data: {
      bio?: string;
      city?: string;
      state?: string;
      primarySport?: string;
      interests?: string[];
      achievements?: string[];
    }
  ): Promise<IUser | null> {
    const updatedUser = await userRepository.update(id, data);

    if (!updatedUser) {
      return null;
    }

    // Crew keeps city/state as a marketplace/search cache for
    // backward compatibility with the existing Crew architecture.
    // The main User profile remains the source of truth.
    if (data.city !== undefined || data.state !== undefined) {
      const crewUpdate: {
        city?: string;
        state?: string;
      } = {};

      if (data.city !== undefined && data.city.trim()) {
        crewUpdate.city = data.city.trim();
      }

      if (data.state !== undefined && data.state.trim()) {
        crewUpdate.state = data.state.trim();
      }

      if (Object.keys(crewUpdate).length > 0) {
        await CrewModel.updateOne(
          { userId: id },
          { $set: crewUpdate }
        );
      }
    }

    return updatedUser;
  }

  async getPerformance(id: string) {
    console.log("🔎 PERFORMANCE USER ID:", id);
    const [competitionEntries, registrations] =
      await Promise.all([
        competitionEntryRepository.findByParticipantUserId(id),
        tournamentRegistrationRepository.findByUser(id),
      ]);

    const entryIds = competitionEntries.map(
      (entry: any) => entry._id.toString()
    );

    const matches =
      await matchRepository.findCompletedByEntryIds(
        entryIds
      );

    /*
     * Build tournament history from actual completed matches first.
     * This keeps Results & Achievements available even if a registration
     * record is later cancelled/changed.
     */
    const completedTournamentIds = [
      ...new Set(
        matches.map((match: any) =>
          match.tournamentId.toString()
        )
      ),
    ];

    const playedTournaments =
      completedTournamentIds.length > 0
        ? await (await import(
            "../../tournaments/models/tournament.model.js"
          )).TournamentModel.find({
            _id: { $in: completedTournamentIds },
            status: TournamentStatus.COMPLETED,
          })
        : [];

    const playedTournamentMap = new Map(
      playedTournaments.map((tournament: any) => [
        tournament._id.toString(),
        tournament,
      ])
    );

    const registeredCompletedTournaments =
      registrations.filter((registration: any) => {
        const tournament = registration.tournamentId;

        return (
          registration.status === "REGISTERED" &&
          tournament &&
          tournament.status === TournamentStatus.COMPLETED
        );
      });

    const historyTournamentIds = new Set([
      ...registeredCompletedTournaments.map(
        (registration: any) =>
          registration.tournamentId._id.toString()
      ),
      ...completedTournamentIds.filter((id) =>
        playedTournamentMap.has(id)
      ),
    ]);

    const tournamentsPlayed =
      historyTournamentIds.size;

    const entryIdSet = new Set(entryIds);

    let wins = 0;
    let losses = 0;

    for (const match of matches) {
      const isParticipant =
        entryIdSet.has(match.teamA) ||
        entryIdSet.has(match.teamB);

      if (!isParticipant || !match.winner) {
        continue;
      }

      if (entryIdSet.has(match.winner.toString())) {
        wins++;
      } else {
        losses++;
      }
    }

    const matchesPlayed = wins + losses;

    const winRate =
      matchesPlayed > 0
        ? Math.round((wins / matchesPlayed) * 100)
        : 0;

    let podiums = 0;

    const tournamentHistory: any[] = [];

    for (const historyTournamentId of historyTournamentIds) {
      const registeredTournament = registeredCompletedTournaments.find(
        (registration: any) =>
          registration.tournamentId?._id?.toString() === historyTournamentId
      );

      const tournament =
        registeredTournament?.tournamentId ??
        playedTournamentMap.get(historyTournamentId);

      if (!tournament) {
        continue;
      }

      const tournamentId =
        tournament?._id?.toString?.() ??
        tournament?.toString?.();

      if (!tournamentId || !tournament?._id) {
        continue;
      }

      const tournamentMatches =
        await matchRepository.findByTournament(tournamentId);

      const tournamentEntryIds = new Set(
        competitionEntries
          .filter(
            (entry: any) =>
              entry.tournamentId?.toString() ===
              tournamentId
          )
          .map((entry: any) =>
            entry._id.toString()
          )
      );

      const playerMatches = tournamentMatches.filter(
        (match: any) =>
          match.status === "COMPLETED" &&
          (tournamentEntryIds.has(
            match.teamA
          ) ||
            tournamentEntryIds.has(
              match.teamB
            ))
      );

      const tournamentWins = playerMatches.filter(
        (match: any) =>
          match.winner &&
          tournamentEntryIds.has(
            match.winner.toString()
          )
      ).length;

      const tournamentLosses =
        playerMatches.filter(
          (match: any) =>
            match.winner &&
            !tournamentEntryIds.has(
              match.winner.toString()
            )
        ).length;

      const finalMatch = tournamentMatches.find(
        (match: any) =>
          match.round === "FINAL" &&
          match.status === "COMPLETED"
      );

      let placement:
        | "CHAMPION"
        | "RUNNER_UP"
        | null = null;

      if (finalMatch?.winner) {
        const champion =
          finalMatch.winner.toString();

        const runnerUp =
          champion ===
          finalMatch.teamA?.toString()
            ? finalMatch.teamB?.toString()
            : finalMatch.teamA?.toString();

        const isChampion =
          tournamentEntryIds.has(champion);

        const isRunnerUp =
          runnerUp
            ? tournamentEntryIds.has(runnerUp)
            : false;

        if (isChampion) {
          placement = "CHAMPION";
          podiums++;
        } else if (isRunnerUp) {
          placement = "RUNNER_UP";
          podiums++;
        }
      }

      tournamentHistory.push({
        tournamentId,
        title: tournament.title,
        sport: tournament.sport,
        format: tournament.format,
        type: tournament.type,
        city: tournament.city,
        state: tournament.state,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        status: tournament.status,
        matchesPlayed: playerMatches.length,
        wins: tournamentWins,
        losses: tournamentLosses,
        placement,
      });
    }

    tournamentHistory.sort(
      (a, b) =>
        new Date(b.endDate).getTime() -
        new Date(a.endDate).getTime()
    );

    return {
      tournamentsPlayed,
      matchesPlayed,
      wins,
      losses,
      winRate,
      podiums,
      matchStatsAvailable: matchesPlayed > 0,
      podiumStatsAvailable: podiums > 0,
      tournamentHistory,
    };
  }

  async searchPlayers(
    query: string,
    currentUserId: string
  ) {
    const search = query.trim();

    if (!search) {
      return [];
    }

    const regex = new RegExp(
      search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    const players = await User.find({
      _id: { $ne: currentUserId },
      role: UserRole.PLAYER,
      $or: [
        { fullName: regex },
        { email: regex },
      ],
    })
      .select("_id fullName profileImage city state")
      .sort({ fullName: 1 })
      .limit(10)
      .lean();

    return players.map((player) => ({
      id: player._id.toString(),
      fullName: player.fullName,
      profileImage: player.profileImage ?? "",
      city: player.city ?? "",
      state: player.state ?? "",
    }));
  }

  async register(data: RegisterUserInput): Promise<IUser> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const payload: any = {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
    };
    
    if (data.phone) {
      payload.phone = data.phone;
    }
    
    if (data.role) {
      payload.role = data.role;
    }
    
    const user = await userRepository.create(payload);

    return user;
  }
}

export const userService = new UserService();