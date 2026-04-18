/* ================= POMODORO ================= */

import mongoose from "mongoose"

const pomodoroSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    time: {
      type: Number,
      required: true
    }, // minutes

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

pomodoroSchema.index({ user: 1, date: -1 })

export const Pomodoro = mongoose.model("Pomodoro",pomodoroSchema)