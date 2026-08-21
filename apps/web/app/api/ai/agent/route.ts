import { NextResponse } from 'next/server';
import { authorize } from '@/lib/middleware';
import { searchTournamentsTool, registerTournamentTool, checkOrganizerStatusTool } from '@/lib/ai/tools';
import { getSessionHistory, saveMessageToHistory } from '@/lib/ai/memory';

export async function POST(req: Request) {
  const auth = authorize(req);
  if (!auth.isAuthorized) return auth.response;

  try {
    const { prompt, sessionId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const currentSession = sessionId || auth.user.userId;
    const lowerPrompt = prompt.toLowerCase();

    let toolOutput = "";
    let actionExecuted = "GENERAL_CONVERSATION";

    // 1. Intent Classification & LangChain Tool Invocation
    if (lowerPrompt.includes("search") || lowerPrompt.includes("find") || lowerPrompt.includes("dikhao") || lowerPrompt.includes("tournament")) {
      actionExecuted = "SEARCH_TOURNAMENTS";
      
      let sport = undefined;
      if (lowerPrompt.includes("football")) sport = "Football";
      if (lowerPrompt.includes("badminton")) sport = "Badminton";
      if (lowerPrompt.includes("cricket")) sport = "Cricket";

      let city = undefined;
      if (lowerPrompt.includes("jaipur")) city = "Jaipur";
      if (lowerPrompt.includes("lucknow")) city = "Lucknow";
      if (lowerPrompt.includes("delhi")) city = "Delhi";

      const res = await searchTournamentsTool.invoke({ sport, city });
      toolOutput = typeof res === 'string' ? res : JSON.stringify(res);
    } 
    else if (lowerPrompt.includes("register") || lowerPrompt.includes("join") || lowerPrompt.includes("book")) {
      actionExecuted = "REGISTER_TOURNAMENT";
      
      const res = await registerTournamentTool.invoke({
        tournamentId: "65f1a2b3c4d5e6f7a8b9c0d1",
        userId: auth.user.userId,
        teamName: "Sportora Titans",
        contactPhone: "9876543210"
      });
      toolOutput = typeof res === 'string' ? res : JSON.stringify(res);
    }
    else if (lowerPrompt.includes("status") || lowerPrompt.includes("verification")) {
      actionExecuted = "CHECK_VERIFICATION_STATUS";
      
      const res = await checkOrganizerStatusTool.invoke({ userId: auth.user.userId });
      toolOutput = typeof res === 'string' ? res : JSON.stringify(res);
    }

    // 2. Format Response Output
    let finalAnswer = "";
    if (toolOutput) {
      finalAnswer = `[Sportora Agent Executed: ${actionExecuted}]\nResult: ${toolOutput}`;
    } else {
      finalAnswer = `I am your Sportora AI Assistant! You can ask me to search tournaments in any city, check your registration eligibility, or check your organizer verification status.`;
    }

    // 3. Save to History
    saveMessageToHistory(currentSession, 'user', prompt);
    saveMessageToHistory(currentSession, 'assistant', finalAnswer);

    return NextResponse.json({
      success: true,
      actionTaken: actionExecuted,
      reply: finalAnswer,
      conversationHistory: getSessionHistory(currentSession)
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
