export interface AgentUser {
  id: string;
  role: string;
}


export type AgentIntent =
  | "TOURNAMENT_DISCOVERY"
  | "TOURNAMENT_DETAILS"
  | "TOURNAMENT_REGISTRATION"
  | "REGISTRATION_STATUS"
  | "REGISTRATION_CANCELLATION"
  | "PAYMENT"
  | "MATCH"
  | "PROFILE"
  | "UNKNOWN";

export interface AgentEntity {
  type: "TOURNAMENT" | "REGISTRATION" | "MATCH" | "USER";
  id: string;
  label?: string;
}

export interface AgentCandidateTournament {
  id: string;
  title: string;
  sport?: string;
  city?: string;
  entryFee?: number;
}

export type AgentGoalType =
  | "DISCOVER_TOURNAMENT"
  | "VIEW_TOURNAMENT"
  | "REGISTER_TOURNAMENT"
  | "CHECK_REGISTRATIONS"
  | "CANCEL_REGISTRATION"
  | "CHECK_MATCH"
  | "VIEW_PROFILE"
  | "PAYMENT";

export type AgentWorkflowStage =
  | "IDLE"
  | "UNDERSTANDING"
  | "DISCOVERING"
  | "SELECTING"
  | "VIEWING_DETAILS"
  | "REGISTRATION"
  | "WAITING_CONFIRMATION"
  | "PAYMENT_READY"
  | "PAYMENT_PENDING"
  | "VERIFYING"
  | "COMPLETED"
  | "NEEDS_CLARIFICATION"
  | "FAILED";

export type AgentStepStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export interface AgentGoal {
  type: AgentGoalType;
  status: AgentWorkflowStage;
  description?: string;
  constraints?: Record<string, unknown>;
  requiredInformation?: string[];
  completedSteps?: string[];
  pendingAction?: string;
  lastObservation?: string;
  updatedAt?: Date;
}

export interface AgentState {
  activeIntent: AgentIntent;
  activeEntity?: AgentEntity;
  candidateTournaments: AgentCandidateTournament[];
  goal?: AgentGoal;
  lastTool?: string;
  lastUserMessage?: string;
  updatedAt?: Date;
}

export interface AgentContext {
  user: AgentUser;
  conversationId?: string;
  requestStartedAt?: Date;
}

export interface AgentToolResult {
  success: boolean;
  data?: unknown;
  message?: string;
}
