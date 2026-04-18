// backend/src/controllers/pomodoro.controller.js

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Pomodoro } from "../models/pomodoro.model.js"

/**
 * POST /api/v1/pomodoro
 * Body: { time } // seconds
 */
export const addPomodoroSession = asyncHandler(async (req, res) => {
  const { time } = req.body

  if (!time || time <= 0) {
    throw new ApiError(400, "Valid time (seconds) is required")
  }

  const session = await Pomodoro.create({
    user: req.user._id,
    time,
    date: Date.now()
  })

  return res
    .status(201)
    .json(new ApiResponse(201, session, "Session saved"))
})  
/**
 * GET /api/v1/pomodoro/today
 */
export const getTodayPomodoro = asyncHandler(async (req, res) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const sessions = await Pomodoro.find({
    user: req.user._id,
    date: { $gte: start, $lte: end }
  })

  const totalTime = sessions.reduce((acc, s) => acc + s.time, 0)

  return res.status(200).json(
    new ApiResponse(200, {
      sessions,
      totalTime
    }, "Today's focus time")
  )
})

/**
 * GET /api/v1/pomodoro/date/:date
 */
export const getPomodoroByDate = asyncHandler(async (req, res) => {
  const { date } = req.params

  const start = new Date(date + "T00:00:00")
  const end = new Date(date + "T23:59:59.999")

  if (isNaN(start.getTime())) {
    throw new ApiError(400, "Invalid date format (YYYY-MM-DD)")
  }

  const sessions = await Pomodoro.find({
    user: req.user._id,
    date: { $gte: start, $lte: end }
  })

  const totalTime = sessions.reduce((acc, s) => acc + s.time, 0)

  return res.status(200).json(
    new ApiResponse(200, {
      sessions,
      totalTime
    }, "Daily focus time")
  )
})

/**
 * GET /api/v1/pomodoro/week
 */
export const getWeeklyPomodoro = asyncHandler(async (req, res) => {
  const now = new Date()

  const firstDay = new Date(now)
  firstDay.setDate(now.getDate() - now.getDay()) // Sunday
  firstDay.setHours(0, 0, 0, 0)

  const lastDay = new Date(firstDay)
  lastDay.setDate(firstDay.getDate() + 6)
  lastDay.setHours(23, 59, 59, 999)

  const sessions = await Pomodoro.find({
    user: req.user._id,
    date: { $gte: firstDay, $lte: lastDay }
  })

  const totalTime = sessions.reduce((acc, s) => acc + s.time, 0)

  return res.status(200).json(
    new ApiResponse(200, {
      sessions,
      totalTime
    }, "Weekly focus time")
  )
})
