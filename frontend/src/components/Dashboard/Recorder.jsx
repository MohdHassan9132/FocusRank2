import { useState, useEffect } from "react";
import { useStudyTime } from "../../context/StudyTimeContext";
import { createVideoSession, getVideoStats } from "../../api/video.api";

export default function FileUploadBox() {
  const studyTime = useStudyTime() || {};

  const productiveSeconds = studyTime.productiveSeconds || 0;
  const addProductiveSeconds =
    studyTime.addProductiveSeconds || (() => {});

  const [durationMin, setDurationMin] = useState(null);
  const [fileName, setFileName] = useState("");

  /* ──── New state for backend integration ──── */
  const [dailyTotal, setDailyTotal] = useState(0)
  const [ytUrl, setYtUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastDuration, setLastDuration] = useState(null);
  const [range, setRange] = useState("daily");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  /* ──── Helpers ──── */
  const formatProductive = () => {
    const h = Math.floor(productiveSeconds / 3600);
    const m = Math.floor((productiveSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  /* ──── Local file handling (original) ──── */
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

  /* ──── Fetch stats whenever range changes ──── */
  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    try {
      const res = await getVideoStats(range);
      setStats(res.data);
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  /* ──── YouTube submit ──── */
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


useEffect(() => {
  const fetchDaily = async () => {
    const res = await getVideoStats("daily")
    setDailyTotal(res.data.totalSeconds)
  }

  fetchDaily()
}, [])

  /* ──── Local video submit (server) ──── */
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

  /* ──── Range button classes ──── */
  const rangeBtnClass = (r) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
      range === r
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-6">
      {/* ──── Focused Time Today (original) ──── */}
<div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-sm">
  <div className="text-sm opacity-90">Focused Time Today</div>
<div className="text-2xl font-semibold mt-1">
  {formatDuration(dailyTotal)}
</div>
</div>

      {/* ──── Last Duration Banner ──── */}
      {lastDuration !== null && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm">
          <div className="text-sm opacity-90">Last Duration</div>
          <div className="text-2xl font-semibold mt-1">
            {formatDuration(lastDuration)}
          </div>
        </div>
      )}

      {/* ──── Upload Card ──── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Record / Upload Study Session
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload raw study video. Duration is read locally.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ── YouTube input ── */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600">
            YouTube Link
          </label>
          <div className="flex gap-2">
            <input
              id="yt-url-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              id="yt-submit-btn"
              onClick={handleYtSubmit}
              disabled={loading || !ytUrl.trim()}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition"
            >
              {loading ? "Processing…" : "Submit"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 border-t border-slate-200" />
          or
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* ── Local file upload (original) ── */}
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFile(file);       // original local preview
              setVideoFile(file);     // store for server upload
            }}
          />

          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition">
            Click to upload study video
          </div>
        </label>

        {durationMin !== null && (
          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <div className="text-sm text-slate-700">
              <span className="font-medium">File:</span> {fileName}
            </div>

            <div className="text-sm text-slate-700">
              Detected duration:
              <span className="ml-1 font-semibold">
                {durationMin} min
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmTime}
                className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-sm font-medium text-white transition"
              >
                Add Study Time
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
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
            Processing video…
          </div>
        )}
      </div>

      {/* ──── Stats Card ──── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Video Stats
        </h2>

        {/* Range buttons */}
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map((r) => (
            <button
              key={r}
              id={`range-${r}-btn`}
              onClick={() => setRange(r)}
              className={rangeBtnClass(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats content */}
        {stats && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Total: {formatDuration(stats.totalSeconds)}
            </h3>

            {stats.data.length === 0 ? (
              <p className="text-sm text-slate-400">No data for this range.</p>
            ) : (
              <div className="space-y-1">
                {stats.data.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-indigo-600 font-semibold">
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