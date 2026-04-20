// backend/src/utils/videoDuration.util.js

import ffmpeg from "fluent-ffmpeg"
import ffmpegPath from "ffmpeg-static"
import ffprobe from "ffprobe-static"



ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobe.path)

const YT_API_KEY = process.env.YOUTUBE_API_KEY

function extractVideoId(url) {
  try {
    const parsed = new URL(url)

    // https://www.youtube.com/watch?v=abc123
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v")
    }

    // https://youtu.be/abc123
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1)
    }

    return null
  } catch {
    return null
  }
}

function parseISODurationToSeconds(duration) {
  // Example: PT1H23M45S
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  )

  if (!match) return null

  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)

  return hours * 3600 + minutes * 60 + seconds
}

export async function getYoutubeDurationInSeconds(ytLink) {
  const videoId = extractVideoId(ytLink)

  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YT_API_KEY}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube video details")
  }

  const data = await response.json()

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found")
  }

  const isoDuration = data.items[0].contentDetails.duration
  const seconds = parseISODurationToSeconds(isoDuration)

  if (!seconds) {
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
