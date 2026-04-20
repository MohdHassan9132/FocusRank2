import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black transition-colors duration-300 flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-purple-900/20" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Start tracking your study time and stay consistent.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>

              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="remember-me"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600"
              />

              <label
                htmlFor="remember-me"
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                I accept the{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                  Terms and Conditions
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <Link
                to="/login"
                className="ml-1 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
