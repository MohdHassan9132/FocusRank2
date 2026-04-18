/* ================= TODO ================= */
import mongoose from "mongoose"

const todoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    task: {
      type: String,
      required: true,
      trim: true
    },

    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

todoSchema.index({ user: 1, date: -1 })
todoSchema.index({ user: 1, isCompleted: 1 })

export const Todo = mongoose.model("Todo",todoSchema)

