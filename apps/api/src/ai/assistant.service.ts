import { TournamentModel } from '../models/tournament.model.js';
import { CrewModel } from '../models/crew.model.js';

export class AgenticAssistantService {
  /**
   * Processes natural language prompt and returns actionable insights & search data
   */
  public static async processUserPrompt(prompt: string) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract intent and basic parameters
    const isSearchingTournament = lowerPrompt.includes('tournament') || lowerPrompt.includes('match');
    const isSearchingCrew = lowerPrompt.includes('referee') || lowerPrompt.includes('umpire') || lowerPrompt.includes('crew');
    
    let city = 'Jaipur'; // Default fallback or extract from prompt
    if (lowerPrompt.includes('delhi')) city = 'Delhi';
    if (lowerPrompt.includes('mumbai')) city = 'Mumbai';

    let sport = 'Badminton';
    if (lowerPrompt.includes('cricket')) sport = 'Cricket';
    if (lowerPrompt.includes('football')) sport = 'Football';

    const results: any = {};

    if (isSearchingTournament) {
      results.tournaments = await TournamentModel.find({ city, sport }).limit(5);
    }

    if (isSearchingCrew) {
      results.crew = await CrewModel.find({ city, isAvailable: true }).limit(5);
    }

    return {
      intentDetected: {
        searchingTournament: isSearchingTournament,
        searchingCrew: isSearchingCrew,
        targetCity: city,
        targetSport: sport,
      },
      aiSuggestion: `Found available options for ${sport} in ${city}. You can proceed with registration or booking.`,
      data: results,
    };
  }
}
