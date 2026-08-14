export interface AgentUser {
  id: string;
  role: string;
}

export interface AgentContext {
  user: AgentUser;
  conversationId?: string;
}

export interface AgentToolResult {
  success: boolean;
  data?: unknown;
  message?: string;
}
