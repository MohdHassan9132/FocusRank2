import mongoose from "mongoose"

const rankSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true
    },

    minTimeStudied: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

rankSchema.index({ number: 1 })
rankSchema.index({ minTimeStudied: 1 })

export const Rank = mongoose.model("Rank",rankSchema)