/* ================= VIDEO ================= */
import mongoose from "mongoose"
const videoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    duration: {
      type: Number,
      required: true
    }, // seconds

    source: {
      type: String,
      enum: ["yt", "local"],
      required: true
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

videoSchema.index({ user: 1, date: -1 })

export const Video = mongoose.model("Video",videoSchema)