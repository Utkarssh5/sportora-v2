interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// In-Memory store mapped by Session / User ID
const sessionMemoryStore = new Map<string, ChatMessage[]>();

export function getSessionHistory(sessionId: string): ChatMessage[] {
  if (!sessionMemoryStore.has(sessionId)) {
    sessionMemoryStore.set(sessionId, []);
  }
  return sessionMemoryStore.get(sessionId)!;
}

export function saveMessageToHistory(sessionId: string, role: 'user' | 'assistant', content: string) {
  const history = getSessionHistory(sessionId);
  history.push({ role, content });
  
  // Keep last 10 messages for context efficiency
  if (history.length > 10) {
    history.shift();
  }
}
