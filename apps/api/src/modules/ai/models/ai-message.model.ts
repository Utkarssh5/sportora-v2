import { Schema, model, type InferSchemaType } from "mongoose";

const aiMessageSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

aiMessageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

export type AIMessage =
  InferSchemaType<typeof aiMessageSchema>;

export const AIMessageModel =
  model<AIMessage>(
    "AIMessage",
    aiMessageSchema
  );
