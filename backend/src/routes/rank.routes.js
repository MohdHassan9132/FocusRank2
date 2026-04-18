import express from "express"
import {
  getDailyRanking,
  getWeeklyRanking,
  getMonthlyRanking
} from "../controllers/rank.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js" // if you have auth

const router = express.Router()

// ===== ROUTES =====

// Daily ranking
router.get("/daily", verifyJWT, getDailyRanking)

// Weekly ranking
router.get("/weekly", verifyJWT, getWeeklyRanking)

// Monthly ranking
router.get("/monthly", verifyJWT, getMonthlyRanking)

export default router