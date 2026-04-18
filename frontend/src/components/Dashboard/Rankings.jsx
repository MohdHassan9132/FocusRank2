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

  // Format total time from seconds to hours and minutes
  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch rankings when period changes
  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchRankings(period);
        
        // Transform API data to match the table format
        const transformedData = response.data.map((item, index) => ({
          rank: index + 1,
          userId: item.userId,
          name: item.username,
          seconds: item.totalTime,
          isYou: user && item.userId === user._id
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

  // Find current user's data for the bottom card
  const currentUser = rankings.find(userItem => userItem.isYou);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">🏆 Study Rankings</h1>

        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {PERIODS.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading rankings...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && (
        <>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-3 bg-gray-100 text-sm font-semibold">
              <span>Rank</span>
              <span>User</span>
              <span>Study Time</span>
            </div>

            {rankings.map((userItem) => (
              <div
                key={userItem.rank}
                className={`grid grid-cols-3 px-4 py-3 text-sm border-t ${
                  userItem.isYou ? "bg-blue-50 font-semibold" : ""
                }`}
              >
                <span>#{userItem.rank}</span>
                <span>{userItem.name}</span>
                <span>{formatStudyTime(userItem.seconds)}</span>
              </div>
            ))}
          </div>

          {/* Your Rank Card - Only show if user is in rankings */}
          {currentUser && (
            <div className="border rounded-xl p-4 bg-gradient-to-r from-blue-50 to-white">
              <p className="text-sm text-gray-600">Your Position</p>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-lg font-bold">Rank #{currentUser.rank}</p>
                  <p className="text-sm text-gray-500">
                    {period} · {category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatStudyTime(currentUser.seconds)} studied</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}