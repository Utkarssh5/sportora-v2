import { Schema, model, type InferSchemaType } from "mongoose";

const aiConversationSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export type AIConversation =
  InferSchemaType<typeof aiConversationSchema>;

export const AIConversationModel =
  model<AIConversation>(
    "AIConversation",
    aiConversationSchema
  );
