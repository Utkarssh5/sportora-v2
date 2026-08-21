import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Tournament, Registration, VerificationRequest } from "@/models/Database";

// Tool 1: Tournament Search Tool
export const searchTournamentsTool = new DynamicStructuredTool({
  name: "search_tournaments",
  description: "Searches for sports tournaments by sport name, city, or max entry fee.",
  schema: z.object({
    sport: z.string().optional().describe("Sport type e.g. Football, Badminton, Cricket"),
    city: z.string().optional().describe("City name e.g. Jaipur, Lucknow, Delhi"),
    maxFee: z.number().optional().describe("Maximum entry fee limit in INR"),
  }),
  func: async ({ sport, city, maxFee }) => {
    await connectToDatabase();
    let query: any = {};
    if (sport) query.sport = { $regex: sport, $options: "i" };
    if (city) query.city = { $regex: city, $options: "i" };
    if (maxFee) query.entryFee = { $lte: maxFee };

    const tournaments = await Tournament.find(query).limit(5);
    if (tournaments.length === 0) return "No tournaments found matching the given criteria.";
    
    return JSON.stringify(tournaments.map(t => ({
      id: t._id,
      title: t.title,
      sport: t.sport,
      city: t.city,
      date: t.date,
      entryFee: t.entryFee,
      availableSlots: t.maxTeams - t.registeredTeams.length
    })));
  }
});

// Tool 2: Automatic Tournament Registration Tool
export const registerTournamentTool = new DynamicStructuredTool({
  name: "register_tournament",
  description: "Registers a user and their team for a specific tournament ID.",
  schema: z.object({
    tournamentId: z.string().describe("MongoDB ID of the target tournament"),
    userId: z.string().describe("User ID performing the registration"),
    teamName: z.string().describe("Name of the team registering"),
    contactPhone: z.string().describe("Contact phone number"),
  }),
  func: async ({ tournamentId, userId, teamName, contactPhone }) => {
    await connectToDatabase();
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) return "Error: Tournament not found.";
    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      return "Error: Registration failed. Tournament is completely full!";
    }

    const reg = await Registration.create({
      tournamentId,
      userId,
      teamName,
      contactPhone
    });

    tournament.registeredTeams.push(teamName);
    await tournament.save();

    return `Success! Team "${teamName}" registered for "${tournament.title}". Registration ID: ${reg._id}`;
  }
});

// Tool 3: Organizer Verification Status Tool
export const checkOrganizerStatusTool = new DynamicStructuredTool({
  name: "check_organizer_status",
  description: "Checks the organizer verification status for a given user.",
  schema: z.object({
    userId: z.string().describe("User ID of the organizer"),
  }),
  func: async ({ userId }) => {
    await connectToDatabase();
    const req = await VerificationRequest.findOne({ userId }).sort({ submittedAt: -1 });

    if (!req) return "Organizer status: No verification request submitted yet.";
    return `Organizer status: ${req.status}. Submitted for "${req.organizationName}". ${req.rejectionReason ? `Reason: ${req.rejectionReason}` : ""}`;
  }
});
