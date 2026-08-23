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

    agentState: {
      activeIntent: {
        type: String,
        enum: [
          "TOURNAMENT_DISCOVERY",
          "TOURNAMENT_DETAILS",
          "TOURNAMENT_REGISTRATION",
          "REGISTRATION_STATUS",
          "REGISTRATION_CANCELLATION",
          "PAYMENT",
          "MATCH",
          "PROFILE",
          "UNKNOWN",
        ],
        default: "UNKNOWN",
      },

      activeEntity: {
        type: {
          type: String,
          enum: ["TOURNAMENT", "REGISTRATION", "MATCH", "USER"],
          default: null,
        },
        id: {
          type: String,
          default: null,
        },
        label: {
          type: String,
          default: null,
        },
      },

      candidateTournaments: {
        type: [
          {
            id: String,
            title: String,
            sport: String,
            city: String,
            entryFee: Number,
          },
        ],
        default: [],
      },

      goal: {
        type: {
          type: String,
          enum: [
            "DISCOVER_TOURNAMENT",
            "VIEW_TOURNAMENT",
            "REGISTER_TOURNAMENT",
            "CHECK_REGISTRATIONS",
            "CANCEL_REGISTRATION",
            "CHECK_MATCH",
            "VIEW_PROFILE",
            "PAYMENT",
          ],
          default: null,
        },

        status: {
          type: String,
          enum: [
            "IDLE",
            "UNDERSTANDING",
            "DISCOVERING",
            "SELECTING",
            "VIEWING_DETAILS",
            "REGISTRATION",
            "WAITING_CONFIRMATION",
            "PAYMENT_READY",
            "PAYMENT_PENDING",
            "VERIFYING",
            "COMPLETED",
            "NEEDS_CLARIFICATION",
            "FAILED",
          ],
          default: "IDLE",
        },

        description: {
          type: String,
          default: null,
        },

        constraints: {
          type: Schema.Types.Mixed,
          default: {},
        },

        requiredInformation: {
          type: [String],
          default: [],
        },

        completedSteps: {
          type: [String],
          default: [],
        },

        pendingAction: {
          type: String,
          default: null,
        },

        lastObservation: {
          type: String,
          default: null,
        },

        plan: {
          version: {
            type: Number,
            default: 1,
          },

          steps: {
            type: [
              {
                id: {
                  type: String,
                  required: true,
                },
                action: {
                  type: String,
                  required: true,
                },
                description: {
                  type: String,
                  required: true,
                },
                status: {
                  type: String,
                  enum: [
                    "PENDING",
                    "COMPLETED",
                    "FAILED",
                  ],
                  default: "PENDING",
                },
                toolName: {
                  type: String,
                  default: null,
                },
                dependsOn: {
                  type: [String],
                  default: [],
                },
                observation: {
                  type: String,
                  default: null,
                },
              },
            ],
            default: [],
          },

          currentStepId: {
            type: String,
            default: null,
          },

          createdAt: {
            type: Date,
            default: null,
          },

          updatedAt: {
            type: Date,
            default: null,
          },
        },

        updatedAt: {
          type: Date,
          default: null,
        },
      },

      lastTool: {
        type: String,
        default: null,
      },

      lastUserMessage: {
        type: String,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    pendingRegistration: {
      tournamentId: {
        type: String,
        default: null,
      },
      action: {
        type: String,
        enum: ["PAYMENT_REQUIRED", "FREE_REGISTRATION"],
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
      confirmedAt: {
        type: Date,
        default: null,
      },
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
