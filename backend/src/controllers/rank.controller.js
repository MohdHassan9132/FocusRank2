import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Pomodoro } from "../models/pomodoro.model.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.models.js"

// ===== DATE HELPERS =====
const getStartOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfDay = (date) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  return start
}

const getEndOfWeek = (date) => {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

const getStartOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}

const getEndOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

// ===== COMMON RANK LOGIC =====
const getRanking = async (start, end) => {
  // Pomodoro aggregation
  const pomodoroAgg = await Pomodoro.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: "$user",
        total: { $sum: "$time" }
      }
    }
  ])

  // Video aggregation
  const videoAgg = await Video.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: "$user",
        total: { $sum: "$duration" }
      }
    }
  ])

  // merge both
  const map = new Map()

  pomodoroAgg.forEach(item => {
    map.set(item._id.toString(), item.total)
  })

  videoAgg.forEach(item => {
    const prev = map.get(item._id.toString()) || 0
    map.set(item._id.toString(), prev + item.total)
  })

  // Get all unique user IDs
  const userIds = Array.from(map.keys())
  
  // Fetch user details (username) for all users in ranking
  const users = await User.find(
    { _id: { $in: userIds } },
    { username: 1, _id: 1 }
  )
  
  // Create a map of user ID to username
  const userMap = new Map()
  users.forEach(user => {
    userMap.set(user._id.toString(), user.username)
  })

  // convert to array with usernames
  const ranking = Array.from(map.entries()).map(([userId, totalTime]) => ({
    userId,
    username: userMap.get(userId) || `User ${userId.slice(-4)}`,
    totalTime
  }))

  // sort descending
  ranking.sort((a, b) => b.totalTime - a.totalTime)

  return ranking
}

// ===== CONTROLLERS =====

// 📅 DAILY
export const getDailyRanking = asyncHandler(async (req, res) => {
  const today = new Date()

  const ranking = await getRanking(
    getStartOfDay(today),
    getEndOfDay(today)
  )

  return res.status(200).json(
    new ApiResponse(200, ranking, "Daily ranking fetched")
  )
})

// 📆 WEEKLY
export const getWeeklyRanking = asyncHandler(async (req, res) => {
  const today = new Date()

  const ranking = await getRanking(
    getStartOfWeek(today),
    getEndOfWeek(today)
  )

  return res.status(200).json(
    new ApiResponse(200, ranking, "Weekly ranking fetched")
  )
})

// 📊 MONTHLY
export const getMonthlyRanking = asyncHandler(async (req, res) => {
  const today = new Date()

  const ranking = await getRanking(
    getStartOfMonth(today),
    getEndOfMonth(today)
  )

  return res.status(200).json(
    new ApiResponse(200, ranking, "Monthly ranking fetched")
  )
})