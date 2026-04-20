import { useState, useEffect } from "react";
import { useStudyTime } from "../../context/StudyTimeContext";
import { createVideoSession, getVideoStats } from "../../api/video.api";

export default function FileUploadBox() {
  const studyTime = useStudyTime() || {};
  const productiveSeconds = studyTime.productiveSeconds || 0;
  const addProductiveSeconds = studyTime.addProductiveSeconds || (() => {});

  const [durationMin, setDurationMin] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);
  const [ytUrl, setYtUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastDuration, setLastDuration] = useState(null);
  const [range, setRange] = useState("daily");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleFile = (file) => {
    if (!file) return;

    setFileName(file.name);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const minutes = Math.round(video.duration / 60);
      setDurationMin(minutes);
    };
  };

  const confirmTime = () => {
    if (durationMin === null) return;

    addProductiveSeconds(durationMin * 60);
    setDurationMin(null);
    setFileName("");
  };

  const fetchStats = async () => {
    try {
      const res = await getVideoStats(range);
      setStats(res.data);
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  useEffect(() => {
    const fetchDaily = async () => {
      const res = await getVideoStats("daily");
      setDailyTotal(res.data.totalSeconds);
    };

    fetchDaily();
  }, []);

  const handleYtSubmit = async () => {
    if (!ytUrl.trim()) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("source", "yt");
      formData.append("ytLink", ytUrl);

      const res = await createVideoSession(formData);
      setLastDuration(res.data.duration);
      setYtUrl("");
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "YouTube upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSubmit = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("source", "local");
      formData.append("video", videoFile);

      const res = await createVideoSession(formData);
      setLastDuration(res.data.duration);
      setVideoFile(null);
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-black transition-colors duration-300">
      <div className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-5 shadow-sm transition-colors duration-200">
        <div className="text-sm opacity-90 font-medium">Focused Time Today</div>
        <div className="text-3xl font-bold mt-2">{formatDuration(dailyTotal)}</div>
        <div className="text-sm opacity-90 mt-1">
          Tracked locally: {formatDuration(productiveSeconds)}
        </div>
      </div>

      {lastDuration !== null && (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Last Duration
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {formatDuration(lastDuration)}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Record / Upload Study Session
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Upload a raw study video or submit a YouTube link.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            YouTube Link
          </label>
          <div className="flex gap-2">
            <input
              id="yt-url-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="flex-1 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 outline-none focus:border-blue-500"
            />
            <button
              id="yt-submit-btn"
              onClick={handleYtSubmit}
              disabled={loading || !ytUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 text-sm font-bold"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex-1 border-t border-gray-200 dark:border-zinc-800" />
          <span>or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-zinc-800" />
        </div>

        <label className="block cursor-pointer">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFile(file);
              setVideoFile(file);
            }}
          />

          <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950 p-8 text-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200">
            Click to upload study video
          </div>
        </label>

        {durationMin !== null && (
          <div className="rounded-xl bg-gray-50 dark:bg-zinc-950 p-5 space-y-3 border border-gray-200 dark:border-zinc-800">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">File:</span> {fileName}
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              Detected duration:
              <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                {durationMin} min
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={confirmTime}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 px-4 py-2.5 text-sm font-bold"
              >
                Add Study Time
              </button>
              <button
                onClick={handleLocalSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 px-4 py-2.5 text-sm font-bold"
              >
                Upload to Server
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing video...
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Video Stats
        </h2>

        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map((r) => (
            <button
              key={r}
              id={`range-${r}-btn`}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                range === r
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {stats && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Total: {formatDuration(stats.totalSeconds)}
            </h3>

            {stats.data.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No data for this range.
              </p>
            ) : (
              <div className="space-y-2">
                {stats.data.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-zinc-950 px-4 py-3 text-sm border border-gray-200 dark:border-zinc-800"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
                      {formatDuration(item.seconds)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
