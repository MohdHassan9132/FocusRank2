// frontend/src/api/video.api.js

import API from "./axios"

/**
 * POST /api/videos
 * @param {FormData} formData - must include "source" and either "ytLink" or "video" file
 */
export const createVideoSession = async (formData) => {
  const { data } = await API.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return data
}

/**
 * GET /api/videos/stats?range=daily|weekly|monthly
 * @param {"daily"|"weekly"|"monthly"} range
 */
export const getVideoStats = async (range) => {
  const { data } = await API.get("/videos/stats", {
    params: { range }
  })
  return data
}