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

  /*
   * Approach: auto-login after signup.
   * AuthContext.signup() calls signupUser() then loginUser(),
   * so on success the user is fully authenticated and redirected to /dashboard.
   */
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full border border-gray-300 rounded-2xl p-8 bg-white">
        <form className="space-y-6" onSubmit={handleSignup}>
          <h1 className="text-4xl font-semibold text-center">Sign Up</h1>
          <br />

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Email Id
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="text-slate-900 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="text-slate-600 ml-3 text-sm"
            >
              I accept the{" "}
              <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create an account"}
          </button>

          <p className="text-slate-600 text-sm text-center">
            Already have an account?
            <Link
              to="/login"
              className="text-blue-600 ml-1 cursor-pointer hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
