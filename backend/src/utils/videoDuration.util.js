// backend/src/utils/videoDuration.util.js

import ytdl from "@distube/ytdl-core"
import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import ffprobe from "ffprobe-static"

// Configure binary paths
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobe.path)

/**
 * Fetch video duration in seconds from a YouTube link.
 * @param {string} ytLink - full YouTube URL
 * @returns {Promise<number>} duration in seconds (≥ 1)
 */

export async function getYoutubeDurationInSeconds(ytLink) {
  if (!ytdl.validateURL(ytLink)) {
    throw new Error("Invalid YouTube URL")
  }

  const info = await ytdl.getBasicInfo(ytLink)

  const seconds = Number(info.videoDetails.lengthSeconds)

  if (!seconds || Number.isNaN(seconds)) {
    throw new Error("Could not determine video duration")
  }

  return seconds
}

/**
 * Get duration in seconds of a local video file via ffprobe.
 * @param {string} filePath - absolute path to the file on disk
 * @returns {Promise<number>} duration in seconds (≥ 1)
 */
export function getLocalVideoDurationInSeconds(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err)
      const seconds = metadata.format.duration
      resolve(Math.max(1, Math.round(seconds)))
    })
  })
}
