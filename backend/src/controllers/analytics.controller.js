import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Pomodoro } from "../models/pomodoro.model.js"
import { Video } from "../models/video.model.js"

// helper functions
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
  const day = d.getDay() // 0 (Sun) - 6 (Sat)
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

// reusable aggregation
const getTotalTime = async (Model, userId, start, end, field) => {
  const result = await Model.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: `$${field}` }
      }
    }
  ])

  return result[0]?.total || 0
}
export const getDailyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const today = new Date()

  const start = getStartOfDay(today)
  const end = getEndOfDay(today)

  const pomodoroTime = await getTotalTime(Pomodoro, userId, start, end, "time")
  const videoTime = await getTotalTime(Video, userId, start, end, "duration")

  const totalTime = pomodoroTime + videoTime

  return res.status(200).json(
    new ApiResponse(200, {
      pomodoroTime,
      videoTime,
      totalTime
    }, "Daily analytics fetched")
  )
})

export const getWeeklyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const today = new Date()

  const start = getStartOfWeek(today)
  const end = getEndOfWeek(today)

  const pomodoroTime = await getTotalTime(Pomodoro, userId, start, end, "time")
  const videoTime = await getTotalTime(Video, userId, start, end, "duration")

  const totalTime = pomodoroTime + videoTime

  return res.status(200).json(
    new ApiResponse(200, {
      pomodoroTime,
      videoTime,
      totalTime
    }, "Weekly analytics fetched")
  )
})

export const getMonthlyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const today = new Date()

  const start = getStartOfMonth(today)
  const end = getEndOfMonth(today)

  const pomodoroTime = await getTotalTime(Pomodoro, userId, start, end, "time")
  const videoTime = await getTotalTime(Video, userId, start, end, "duration")

  const totalTime = pomodoroTime + videoTime

  return res.status(200).json(
    new ApiResponse(200, {
      pomodoroTime,
      videoTime,
      totalTime
    }, "Monthly analytics fetched")
  )
})
