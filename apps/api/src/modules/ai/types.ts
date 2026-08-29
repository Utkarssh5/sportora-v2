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

export interface AgentPlanStep {
  id: string;
  action: string;
  description: string;
  status: AgentStepStatus;

  toolName?: string;
  dependsOn?: string[];

  requiredInformation?: string[];

  constraints?: Record<string, unknown>;

  successCriteria?: string[];

  verificationCriteria?: string[];

  failureStrategy?:
    | "RETRY"
    | "REPLAN"
    | "ASK_USER"
    | "STOP";

  requiresUserInput?: boolean;

  observation?: string;
}

export interface AgentPlan {
  version: number;
  steps: AgentPlanStep[];
  currentStepId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgentGoal {
  type: AgentGoalType;
  status: AgentWorkflowStage;
  description?: string;
  constraints?: Record<string, unknown>;
  requiredInformation?: string[];
  completedSteps?: string[];
  pendingAction?: string;
  plan?: AgentPlan;
  lastObservation?: string;
  updatedAt?: Date;
}

export interface AgentTournamentSearchContext {
  search?: string;
  sport?: string;
  city?: string;
  state?: string;
  nearby?: boolean;
  status?: string;
  minEntryFee?: number;
  maxEntryFee?: number;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface AgentState {
  activeIntent: AgentIntent;
  activeEntity?: AgentEntity;
  candidateTournaments: AgentCandidateTournament[];
  lastTournamentSearch?: AgentTournamentSearchContext;
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
