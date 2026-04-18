import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
} from "../controllers/user.controller.js";

import {
    getDailyAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics
} from "../controllers/analytics.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// ================= AUTH =================
router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

// ================= ANALYTICS =================
router.route("/analytics/daily").get(verifyJWT, getDailyAnalytics)
router.route("/analytics/weekly").get(verifyJWT, getWeeklyAnalytics)
router.route("/analytics/monthly").get(verifyJWT, getMonthlyAnalytics)

export default router