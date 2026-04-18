// /Users/homefolder/Desktop/Projects/project/frontend/src/components/Dashboard/Timer.jsx

import { useEffect, useState } from "react";
import { useStudyTime } from "../../context/StudyTimeContext";
import { useAuth } from "../../context/AuthContext";
import { 
  createPomodoro, 
  getTodayPomodoro, 
  getPomodoroByDate,
  getWeeklyPomodoro 
} from "../../api/pomodoro.api";

export default function StudyManager() {

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { productiveSeconds, addProductiveSeconds } = useStudyTime();
  const { isAuthenticated } = useAuth();
  const [customMinutes, setCustomMinutes] = useState("");
  
  // Stats states
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);
  const [todaySessions, setTodaySessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateSessions, setDateSessions] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [statsRange, setStatsRange] = useState("today"); // "today", "date", "week"

  // EI additions
  const [sessionIntent, setSessionIntent] = useState("");
  const [reflection, setReflection] = useState(null);

  const elapsedSeconds = totalSeconds - secondsLeft;
  const progress = (elapsedSeconds / totalSeconds) * 100;

  /* ---------------- Helper Functions ---------------- */
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /* ---------------- API Calls ---------------- */
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
        sessions: response.data.data.sessions || []
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
      
      // Group sessions by day of week
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dailyTotals = new Array(7).fill(0);
      
      sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 6 = Saturday
        dailyTotals[dayOfWeek] += session.time;
      });
      
      // Create weekly data structure
      const weeklyStats = daysOfWeek.map((day, index) => ({
        day: day,
        seconds: dailyTotals[index],
        formatted: formatDuration(dailyTotals[index])
      }));
      
      setWeeklyData({
        totalTime: response.data.data.totalTime || 0,
        dailyBreakdown: weeklyStats
      });
    } catch (error) {
      console.error("Failed to fetch weekly stats:", error);
      setWeeklyData(null);
    }
  };

  /* ---------------- Save Session ---------------- */
  const saveSession = async (seconds) => {
    if (!isAuthenticated) return;
    if (seconds < 10) return;
    
    try {
      await createPomodoro(seconds);
      // Refresh all stats after saving
      await Promise.all([
        fetchTodayTotal(),
        fetchWeeklyStats(),
        selectedDate && fetchDateSessions(selectedDate)
      ]);
    } catch (error) {
      console.error("Failed to save study session:", error);
    }
  };

  /* ---------------- Effects ---------------- */
  // Fetch initial data on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayTotal();
      fetchWeeklyStats();
    }
  }, [isAuthenticated]);

  // Fetch date sessions when selected date changes
  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      fetchDateSessions(selectedDate);
    }
  }, [selectedDate, isAuthenticated]);

  /* ---------------- Timer Engine ---------------- */
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

  /* ---------------- Duration Control ---------------- */
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

  /* ---------------- Controls ---------------- */
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

  /* ---------------- Stats Components ---------------- */
  const TodayStats = () => (
    <div className="space-y-3">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-sm">
        <div className="text-sm opacity-90">Today's Total Focus Time</div>
        <div className="text-2xl font-semibold mt-1">{formatDuration(todayTotalSeconds)}</div>
        <div className="text-xs opacity-75 mt-1">{todaySessions.length} session(s)</div>
      </div>
      
      {todaySessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-300">Today's Sessions</h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {todaySessions.map((session, idx) => (
              <div key={session._id || idx} className="rounded-lg bg-neutral-800 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-300">
                    {new Date(session.date).toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-semibold text-indigo-400">
                    {formatDuration(session.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const DateStats = () => (
    <div className="space-y-3">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm"
        placeholder="Select date"
      />
      
      {dateSessions && (
        <>
          <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
            <div className="text-sm opacity-90">Total Focus Time for {selectedDate}</div>
            <div className="text-2xl font-semibold mt-1">{formatDuration(dateSessions.totalTime)}</div>
            <div className="text-xs opacity-75 mt-1">{dateSessions.sessions.length} session(s)</div>
          </div>
          
          {dateSessions.sessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-300">Sessions</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {dateSessions.sessions.map((session, idx) => (
                  <div key={session._id || idx} className="rounded-lg bg-neutral-800 p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-300">
                        {new Date(session.date).toLocaleTimeString()}
                      </span>
                      <span className="text-sm font-semibold text-emerald-400">
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
    </div>
  );

  const WeeklyStats = () => (
    <div className="space-y-3">
      {weeklyData && (
        <>
          <div className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 p-4 text-white shadow-sm">
            <div className="text-sm opacity-90">This Week's Total Focus Time</div>
            <div className="text-2xl font-semibold mt-1">{formatDuration(weeklyData.totalTime)}</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-300">Daily Breakdown</h3>
            <div className="space-y-2">
              {weeklyData.dailyBreakdown.map((day) => (
                <div key={day.day} className="rounded-lg bg-neutral-800 p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-300">{day.day}</span>
                    <span className="text-sm font-semibold text-rose-400">
                      {day.formatted}
                    </span>
                  </div>
                  {day.seconds > 0 && (
                    <div className="mt-2 h-1 bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${(day.seconds / weeklyData.totalTime) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-8 p-4">
      {/* Main Timer Section */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Productive Time Display */}
        <div className="text-center">
          <div className="text-lg text-neutral-300">Focused Time Today</div>
          <div className="text-3xl font-bold text-indigo-400">{formatDuration(todayTotalSeconds)}</div>
        </div>

        {/* Session Intent (IDLE only) */}
        {!isRunning && !isPaused && (
          <input
            value={sessionIntent}
            onChange={(e) => setSessionIntent(e.target.value)}
            placeholder="What are you focusing on?"
            maxLength={60}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-200"
          />
        )}

        {/* Circular Timer */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#262626"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#f59e0b"
              strokeWidth="6"
              fill="none"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className="text-6xl font-mono z-10">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Timer Controls */}
        {!isRunning && !isPaused && (
          <button
            onClick={start}
            className="w-48 px-12 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-lg"
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="w-48 px-12 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-lg"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <>
            <div className="flex gap-4">
              <button
                onClick={resume}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500"
              >
                Resume
              </button>
              <button
                onClick={addStudiedTime}
                className="px-8 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600"
              >
                Add Studied Time
              </button>
            </div>

            {/* Completion Reflection */}
            <div className="flex gap-4 mt-2 text-2xl">
              {["👍", "😐", "👎"].map((r) => (
                <button
                  key={r}
                  onClick={() => setReflection(r)}
                  className={`transition ${
                    reflection === r
                      ? "scale-125"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Duration Settings (IDLE only) */}
        {!isRunning && !isPaused && (
          <>
            <div className="flex gap-2 w-full">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom min"
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
              />
              <button
                onClick={applyCustomTime}
                className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600"
              >
                Set
              </button>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              {[10, 15, 20, 30, 45].map((min) => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    totalSeconds === min * 60
                      ? "bg-indigo-600"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      {isAuthenticated && (
        <div className="w-full max-w-md mt-8">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
            <div className="flex gap-2 border-b border-neutral-800 pb-4">
              {["today", "date", "week"].map((range) => (
                <button
                  key={range}
                  onClick={() => setStatsRange(range)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statsRange === range
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
                >
                  {range === "today" ? "Today" : range === "date" ? "By Date" : "This Week"}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {statsRange === "today" && <TodayStats />}
              {statsRange === "date" && <DateStats />}
              {statsRange === "week" && <WeeklyStats />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}