// frontend/src/api/video.api.js

import axios from "axios"

/**
 * Separate axios instance for video endpoints which are mounted
 * at /api/videos (not under /api/v1).
 */
const VIDEO_API = axios.create({
  baseURL: "http://localhost:8000/api/videos",
  withCredentials: true
})

// Attach Authorization header from localStorage (same pattern as main API)
VIDEO_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * POST /api/videos
 * @param {FormData} formData - must include "source" and either "ytLink" or "video" file
 */
export const createVideoSession = async (formData) => {
  const { data } = await VIDEO_API.post("/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return data
}

/**
 * GET /api/videos/stats?range=daily|weekly|monthly
 * @param {"daily"|"weekly"|"monthly"} range
 */
export const getVideoStats = async (range) => {
  const { data } = await VIDEO_API.get("/stats", {
    params: { range }
  })
  return data
}
