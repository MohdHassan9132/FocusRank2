/* ================= ANALYTICS ================= */

import mongoose from "mongoose"

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    

    periodType: {
      type: String,
      enum: ["day", "week", "month"],
      required: true
    },

    dateKey: {
      type: String,
      required: true
      // examples:
      // day   -> 2025-04-18
      // week  -> 2025-W16
      // month -> 2025-04
    },

    videoTime: {
      type: Number,
      default: 0
    },

    pomodoroTime: {
      type: Number,
      default: 0
    },

    totalTime: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

analyticsSchema.index(
  { user: 1, periodType: 1, dateKey: 1 },
  { unique: true }
)

export const Analytics = mongoose.model("Analytics",analyticsSchema)

