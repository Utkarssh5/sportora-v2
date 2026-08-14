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
