import { useState, useEffect } from "react";
import { fetchRankings } from "../../api/rank.api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const PERIODS = ["Daily", "Weekly", "All Time"];
const CATEGORIES = ["Global", "Engineering", "Medical", "School"];

export default function Rankings() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("Weekly");
  const [category, setCategory] = useState("Global");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchRankings(period);
        const transformedData = response.data.map((item, index) => ({
          rank: index + 1,
          userId: item.userId,
          name: item.username,
          seconds: item.totalTime,
          isYou: user && item.userId === user._id,
        }));

        setRankings(transformedData);
      } catch (err) {
        setError("Failed to load rankings. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRankings();
    }
  }, [period, user]);

  const currentUser = rankings.find((userItem) => userItem.isYou);

  return (
    <div className="w-full bg-white dark:bg-black transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Study Rankings
        </h1>

        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 cursor-pointer"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p} className="bg-white dark:bg-zinc-900">
                {p}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-200 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-zinc-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading rankings...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-700 dark:text-red-300 text-center">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-3 bg-gray-50 dark:bg-zinc-950 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Rank</span>
              <span>User</span>
              <span>Study Time</span>
            </div>

            {rankings.map((userItem) => (
              <div
                key={userItem.rank}
                className={`grid grid-cols-3 px-4 py-3 text-sm border-t border-gray-200 dark:border-zinc-800 ${
                  userItem.isYou
                    ? "bg-blue-50 dark:bg-zinc-800 font-semibold text-blue-700 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-mono">#{userItem.rank}</span>
                <span>{userItem.name}</span>
                <span className="font-mono">
                  {formatStudyTime(userItem.seconds)}
                </span>
              </div>
            ))}
          </div>

          {currentUser && (
            <div className="mt-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Your Position
              </p>
              <div className="flex justify-between items-center mt-2 flex-wrap gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rank #{currentUser.rank}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {period} · {category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatStudyTime(currentUser.seconds)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    studied
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
