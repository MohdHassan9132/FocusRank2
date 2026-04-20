import { useEffect, useState } from "react";
import { useStudyTime } from "../../context/StudyTimeContext";
import { useAuth } from "../../context/AuthContext";
import {
  createPomodoro,
  getTodayPomodoro,
  getPomodoroByDate,
  getWeeklyPomodoro,
} from "../../api/pomodoro.api";

export default function StudyManager() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);
  const [todaySessions, setTodaySessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateSessions, setDateSessions] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [statsRange, setStatsRange] = useState("today");
  const [sessionIntent, setSessionIntent] = useState("");
  const [reflection, setReflection] = useState(null);

  const { addProductiveSeconds } = useStudyTime();
  const { isAuthenticated } = useAuth();

  const elapsedSeconds = totalSeconds - secondsLeft;
  const progress = (elapsedSeconds / totalSeconds) * 100;

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const fetchTodayTotal = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getTodayPomodoro();
      const totalTime = response.data.data.totalTime || 0;
      const sessions = response.data.data.sessions || [];
      setTodayTotalSeconds(totalTime);
      setTodaySessions(sessions);
    } catch (error) {
      console.error("Failed to fetch today's total:", error);
    }
  };

  const fetchDateSessions = async (date) => {
    if (!isAuthenticated || !date) return;

    try {
      const response = await getPomodoroByDate(date);
      setDateSessions({
        totalTime: response.data.data.totalTime || 0,
        sessions: response.data.data.sessions || [],
      });
    } catch (error) {
      console.error("Failed to fetch date sessions:", error);
      setDateSessions(null);
    }
  };

  const fetchWeeklyStats = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getWeeklyPomodoro();
      const sessions = response.data.data.sessions || [];
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dailyTotals = new Array(7).fill(0);

      sessions.forEach((session) => {
        const sessionDate = new Date(session.date);
        const dayOfWeek = sessionDate.getDay();
        dailyTotals[dayOfWeek] += session.time;
      });

      const weeklyStats = daysOfWeek.map((day, index) => ({
        day,
        seconds: dailyTotals[index],
        formatted: formatDuration(dailyTotals[index]),
      }));

      setWeeklyData({
        totalTime: response.data.data.totalTime || 0,
        dailyBreakdown: weeklyStats,
      });
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      setWeeklyData(null);
    }
  };

  const saveSession = async (seconds) => {
    if (!isAuthenticated || seconds < 10) return;

    try {
      await createPomodoro(seconds);
      await Promise.all([
        fetchTodayTotal(),
        fetchWeeklyStats(),
        selectedDate && fetchDateSessions(selectedDate),
      ]);
    } catch (error) {
      console.error("Failed to save study session:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayTotal();
      fetchWeeklyStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      fetchDateSessions(selectedDate);
    }
  }, [selectedDate, isAuthenticated]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 0) {
      setIsRunning(false);
      saveSession(elapsedSeconds);
      addProductiveSeconds(elapsedSeconds);
      setSecondsLeft(totalSeconds);
      setReflection(null);
    }

    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, secondsLeft, totalSeconds, elapsedSeconds]);

  const setDuration = (minutes) => {
    if (isRunning || isPaused) return;
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const applyCustomTime = () => {
    const min = Number(customMinutes);
    if (!min || min <= 0) return;
    setDuration(min);
    setCustomMinutes("");
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const addStudiedTime = () => {
    saveSession(elapsedSeconds);
    addProductiveSeconds(elapsedSeconds);
    setSecondsLeft(totalSeconds);
    setIsPaused(false);
    setReflection(null);
  };

  const cardClass =
    "rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm";

  const StatsWrapper = ({ children }) => (
    <div className="space-y-3">{children}</div>
  );

  const TodayStats = () => (
    <StatsWrapper>
      <div className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-sm transition-colors duration-200">
        <div className="text-sm opacity-90">Today's Total Focus Time</div>
        <div className="text-2xl font-semibold mt-1">
          {formatDuration(todayTotalSeconds)}
        </div>
        <div className="text-xs opacity-75 mt-1">
          {todaySessions.length} session(s)
        </div>
      </div>

      {todaySessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Today's Sessions
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {todaySessions.map((session, idx) => (
              <div
                key={session._id || idx}
                className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-3 border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(session.date).toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatDuration(session.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StatsWrapper>
  );

  const DateStats = () => (
    <StatsWrapper>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm"
        placeholder="Select date"
      />

      {dateSessions && (
        <>
          <div className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-sm transition-colors duration-200">
            <div className="text-sm opacity-90">
              Total Focus Time for {selectedDate}
            </div>
            <div className="text-2xl font-semibold mt-1">
              {formatDuration(dateSessions.totalTime)}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {dateSessions.sessions.length} session(s)
            </div>
          </div>

          {dateSessions.sessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Sessions
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {dateSessions.sessions.map((session, idx) => (
                  <div
                    key={session._id || idx}
                    className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-3 border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(session.date).toLocaleTimeString()}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {formatDuration(session.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </StatsWrapper>
  );

  const WeeklyStats = () => (
    <StatsWrapper>
      {weeklyData && (
        <>
          <div className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-4 shadow-sm transition-colors duration-200">
            <div className="text-sm opacity-90">This Week's Total Focus Time</div>
            <div className="text-2xl font-semibold mt-1">
              {formatDuration(weeklyData.totalTime)}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Daily Breakdown
            </h3>
            <div className="space-y-2">
              {weeklyData.dailyBreakdown.map((day) => (
                <div
                  key={day.day}
                  className="rounded-lg bg-gray-50 dark:bg-zinc-950 p-3 border border-gray-200 dark:border-zinc-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {day.day}
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {day.formatted}
                    </span>
                  </div>
                  {day.seconds > 0 && (
                    <div className="mt-2 h-1 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{
                          width: `${(day.seconds / weeklyData.totalTime) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </StatsWrapper>
  );

  return (
    <div className="bg-white dark:bg-black transition-colors duration-300 space-y-8">
      <div className={`${cardClass} p-8 md:p-10`}>
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Focused Time Today
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
              {formatDuration(todayTotalSeconds)}
            </div>
          </div>

          {!isRunning && !isPaused && (
            <input
              value={sessionIntent}
              onChange={(e) => setSessionIntent(e.target.value)}
              placeholder="What are you focusing on?"
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 outline-none focus:border-blue-500"
            />
          )}

          <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={document.documentElement.classList.contains("dark") ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)"}
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <span className="text-6xl font-mono text-gray-900 dark:text-white z-10">
              {formatTime(secondsLeft)}
            </span>
          </div>

          {!isRunning && !isPaused && (
            <button
              onClick={start}
              className="w-48 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-bold text-lg"
            >
              Start
            </button>
          )}

          {isRunning && (
            <button
              onClick={pause}
              className="w-48 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-bold text-lg"
            >
              Pause
            </button>
          )}

          {isPaused && (
            <>
              <div className="flex gap-4">
                <button
                  onClick={resume}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-bold"
                >
                  Resume
                </button>
                <button
                  onClick={addStudiedTime}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors duration-200 font-bold"
                >
                  Add Studied Time
                </button>
              </div>

              <div className="flex gap-6 mt-2 text-3xl">
                {["Great", "Okay", "Low"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setReflection(r)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      reflection === r
                        ? "bg-blue-600 text-white"
                        : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}

          {!isRunning && !isPaused && (
            <>
              <div className="flex gap-3 w-full">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Custom min"
                  className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 outline-none focus:border-blue-500"
                />
                <button
                  onClick={applyCustomTime}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  Set
                </button>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                {[10, 15, 20, 30, 45].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      totalSeconds === min * 60
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800"
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className={`${cardClass} p-6 md:p-8`}>
          <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 pb-4">
            {["today", "date", "week"].map((range) => (
              <button
                key={range}
                onClick={() => setStatsRange(range)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  statsRange === range
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800"
                }`}
              >
                {range === "today" ? "Today" : range === "date" ? "By Date" : "This Week"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {statsRange === "today" && <TodayStats />}
            {statsRange === "date" && <DateStats />}
            {statsRange === "week" && <WeeklyStats />}
          </div>
        </div>
      )}
    </div>
  );
}
