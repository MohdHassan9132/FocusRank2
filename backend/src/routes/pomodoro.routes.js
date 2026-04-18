// backend/src/routes/pomodoro.routes.js

import { Router } from "express"
import { verifyJWT as protect } from "../middlewares/auth.middleware.js"

import {
  addPomodoroSession,
  getTodayPomodoro,
  getPomodoroByDate,
  getWeeklyPomodoro
} from "../controllers/pomodoro.controller.js"

const router = Router()

router.post("/", protect, addPomodoroSession)

router.get("/today", protect, getTodayPomodoro)
router.get("/date/:date", protect, getPomodoroByDate)
router.get("/week", protect, getWeeklyPomodoro)

export default router