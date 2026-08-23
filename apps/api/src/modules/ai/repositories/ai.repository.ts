import { AIConversationModel } from "../models/ai-conversation.model.js";
import { AIMessageModel } from "../models/ai-message.model.js";


export const aiRepository = {

  async createConversation(
    conversationId: string,
    userId: string
  ) {

    return AIConversationModel.create({
      conversationId,
      userId,
    });
  },


  async getConversation(
    conversationId: string,
    userId: string
  ) {

    return AIConversationModel.findOne({
      conversationId,
      userId,
    });
  },

  async getAgentState(
    conversationId: string
  ) {
    const conversation =
      await AIConversationModel.findOne(
        { conversationId },
        { agentState: 1 }
      ).lean();

    return conversation?.agentState ?? null;
  },


  async updateAgentState(
    conversationId: string,
    state: {
      activeIntent?: string;
      activeEntity?: {
        type: string;
        id: string;
        label?: string;
      } | null;
      candidateTournaments?: Array<{
        id: string;
        title: string;
        sport?: string;
        city?: string;
        entryFee?: number;
      }>;
      goal?: {
        type?: string;
        status?: string;
        description?: string | null;
        constraints?: Record<string, unknown>;
        requiredInformation?: string[];
        completedSteps?: string[];
        pendingAction?: string | null;
        lastObservation?: string | null;
        plan?: {
          version?: number;
          steps?: Array<{
            id: string;
            action: string;
            description: string;
            status?: string;
            toolName?: string;
            dependsOn?: string[];
            observation?: string;
          }>;
          currentStepId?: string | null;
          createdAt?: Date | null;
          updatedAt?: Date | null;
        } | null;
      } | null;
      lastTool?: string | null;
      lastUserMessage?: string | null;
    }
  ) {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          ...(state.activeIntent !== undefined
            ? { "agentState.activeIntent": state.activeIntent }
            : {}),

          ...(state.activeEntity !== undefined
            ? { "agentState.activeEntity": state.activeEntity }
            : {}),

          ...(state.candidateTournaments !== undefined
            ? {
                "agentState.candidateTournaments":
                  state.candidateTournaments,
              }
            : {}),

          ...(state.goal !== undefined
            ? {
                "agentState.goal": state.goal,
              }
            : {}),

          ...(state.lastTool !== undefined
            ? { "agentState.lastTool": state.lastTool }
            : {}),

          ...(state.lastUserMessage !== undefined
            ? {
                "agentState.lastUserMessage":
                  state.lastUserMessage,
              }
            : {}),

          "agentState.updatedAt": new Date(),
        },
      },
      { new: true }
    );
  },


  async updateAgentPlan(
    conversationId: string,
    plan: {
      version: number;
      steps: Array<{
        id: string;
        action: string;
        description: string;
        status?: string;
        toolName?: string;
        dependsOn?: string[];
        observation?: string;
      }>;
      currentStepId?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          "agentState.goal.plan": plan,
          "agentState.updatedAt": new Date(),
        },
      },
      { new: true }
    );
  },

  async setPendingRegistration(
    conversationId: string,
    tournamentId: string,
    action: "PAYMENT_REQUIRED" | "FREE_REGISTRATION"
  ) {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          pendingRegistration: {
            tournamentId,
            action,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
  },

  async getPendingRegistration(
    conversationId: string
  ) {
    const conversation =
      await AIConversationModel.findOne(
        { conversationId },
        { pendingRegistration: 1 }
      ).lean();

    return conversation?.pendingRegistration ?? null;
  },

  async clearPendingRegistration(
    conversationId: string
  ) {
    return AIConversationModel.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          pendingRegistration: {
            tournamentId: null,
            action: null,
            createdAt: null,
            confirmedAt: null,
          },
        },
      },
      { new: true }
    );
  },

  async confirmPendingRegistration(
    conversationId: string,
    requestStartedAt: Date
  ) {
    const conversation =
      await AIConversationModel.findOne({
        conversationId,
      });

    const pending =
      conversation?.pendingRegistration;

    if (
      !conversation ||
      !pending?.tournamentId ||
      !pending?.action ||
      !pending.createdAt ||
      pending.createdAt >= requestStartedAt
    ) {
      return null;
    }

    pending.confirmedAt = new Date();

    await conversation.save();

    return pending;
  },


  async saveMessage(
    conversationId: string,
    role: "user" | "model",
    content: string
  ) {

    return AIMessageModel.create({
      conversationId,
      role,
      content,
    });
  },


  async getMessages(
    conversationId: string,
    limit = 20
  ) {

    return AIMessageModel
      .find({
        conversationId,
      })
      .sort({
        createdAt: 1,
      })
      .limit(limit)
      .lean();
  },
};
