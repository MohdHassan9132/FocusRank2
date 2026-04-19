import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    updateUserAvatar,
    updateUserDescription,
    updateUserDetails,
    getCurrentUser
} from "../controllers/user.controller.js";

import {
    getDailyAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics
} from "../controllers/analytics.controller.js"
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// ================= AUTH =================
router.route("/signup").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/update-details").patch(verifyJWT, updateUserDetails)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-description").patch(verifyJWT, updateUserDescription)
router
    .route("/update-avatar")
    .patch(
        verifyJWT,
        upload.single("avatar"),
        updateUserAvatar
    )


// ================= ANALYTICS =================
router.route("/analytics/daily").get(verifyJWT, getDailyAnalytics)
router.route("/analytics/weekly").get(verifyJWT, getWeeklyAnalytics)
router.route("/analytics/monthly").get(verifyJWT, getMonthlyAnalytics)

export default router