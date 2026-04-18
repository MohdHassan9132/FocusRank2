// backend/src/services/video.service.js

import fs from "fs"
import { Video } from "../models/video.model.js"
import {
  getYoutubeDurationInSeconds,
  getLocalVideoDurationInSeconds
} from "../utils/videoDuration.util.js"

/**
 * Create a video session document.
 * @param {{ userId: string, source: "yt"|"local", ytLink?: string, filePath?: string }} opts
 * @returns {Promise<Document>}
 */
export async function createVideoService({ userId, source, ytLink, filePath }) {
  let duration

  if (source === "yt") {
    duration = await getYoutubeDurationInSeconds(ytLink)
  } else {
    // local
    duration = await getLocalVideoDurationInSeconds(filePath)
    // Remove uploaded file immediately after extracting duration
    fs.unlinkSync(filePath)
  }

  const video = await Video.create({
    user: userId,
    duration, // seconds
    source
  })

  return video
}

/**
 * Get aggregated video stats for a user.
 * @param {string} userId
 * @param {"daily"|"weekly"|"monthly"} range
 */
export async function getVideoStatsService(userId, range) {
  const now = new Date()

  if (range === "daily") {
    return getDailyStats(userId, now)
  } else if (range === "weekly") {
    return getWeeklyStats(userId, now)
  } else {
    return getMonthlyStats(userId, now)
  }
}

/* ─────────── Daily: current day, group by hour ─────────── */
async function getDailyStats(userId, now) {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const videos = await Video.find({
    user: userId,
    date: { $gte: startOfDay, $lt: endOfDay }
  })
    .sort({ date: 1 })
    .select("date duration")

  const data = videos.map((video) => ({
    label: new Date(video.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    }),
    seconds: video.duration
  }))

  const totalSeconds = videos.reduce(
    (sum, video) => sum + video.duration,
    0
  )

  return {
    range: "daily",
    totalSeconds,
    data
  }
}

/* ─────────── Weekly: last 7 days, group by day name ─────────── */
async function getWeeklyStats(userId, now) {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(startOfWeek.getDate() - 6)
  startOfWeek.setHours(0, 0, 0, 0)

  const pipeline = [
    {
      $match: {
        user: userId,
        date: { $gte: startOfWeek, $lte: now }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date"
          }
        },
        seconds: { $sum: "$duration" }
      }
    },
    { $sort: { _id: 1 } }
  ]

  const results = await Video.aggregate(pipeline)

  const data = results.map((r) => ({
    label: new Date(r._id).toLocaleDateString([], {
      weekday: "short"
    }),
    seconds: r.seconds
  }))

  const totalSeconds = results.reduce(
    (sum, item) => sum + item.seconds,
    0
  )

  return {
    range: "weekly",
    totalSeconds,
    data
  }
}

/* ─────────── Monthly: current month, group by day number ─────────── */
async function getMonthlyStats(userId, now) {
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const pipeline = [
    {
      $match: {
        user: userId,
        date: {
          $gte: startOfMonth,
          $lt: endOfMonth
        }
      }
    },
    {
      $group: {
        _id: {
          $ceil: {
            $divide: [{ $dayOfMonth: "$date" }, 7]
          }
        },
        seconds: { $sum: "$duration" }
      }
    },
    { $sort: { _id: 1 } }
  ]

  const results = await Video.aggregate(pipeline)

  const data = results.map((r) => ({
    label: `Week ${r._id}`,
    seconds: r.seconds
  }))

  const totalSeconds = results.reduce(
    (sum, item) => sum + item.seconds,
    0
  )

  return {
    range: "weekly",
    totalSeconds,
    data
  }
}
