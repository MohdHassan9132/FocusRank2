// backend/src/routes/video.routes.js

import { Router } from "express"
import { verifyJWT as protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middlerware.js"
import { createVideo, getVideoStats } from "../controllers/video.controller.js"

const router = Router()

router.post(
  "/",
  protect,
  upload.single("video"),
  createVideo
)

router.get(
  "/stats",
  protect,
  getVideoStats
)

export default router
