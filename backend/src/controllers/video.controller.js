// backend/src/controllers/video.controller.js

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {
  createVideoService,
  getVideoStatsService
} from "../services/video.service.js"

/**
 * POST /api/videos
 * Body (multipart/form-data):
 *   source: "yt" | "local"
 *   ytLink?: string        (required when source === "yt")
 *   video?: File            (required when source === "local")
 */
export const createVideo = asyncHandler(async (req, res) => {
  const { source, ytLink } = req.body

  if (!source || !["yt", "local"].includes(source)) {
    throw new ApiError(400, "source must be 'yt' or 'local'")
  }

  if (source === "yt" && !ytLink) {
    throw new ApiError(400, "ytLink is required when source is 'yt'")
  }

  if (source === "local" && !req.file) {
    throw new ApiError(400, "video file is required when source is 'local'")
  }

  const video = await createVideoService({
    userId: req.user._id,
    source,
    ytLink,
    filePath: req.file?.path
  })

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video session created successfully"))
})

/**
 * GET /api/videos/stats?range=daily|weekly|monthly
 */
export const getVideoStats = asyncHandler(async (req, res) => {
  const range = req.query.range || "daily"

  if (!["daily", "weekly", "monthly"].includes(range)) {
    throw new ApiError(400, "range must be 'daily', 'weekly', or 'monthly'")
  }

  const stats = await getVideoStatsService(req.user._id, range)

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Video stats fetched successfully"))
})
