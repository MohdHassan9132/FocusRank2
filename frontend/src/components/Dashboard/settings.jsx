import { useState } from "react";
import {
  updateUserDetails,
  updateUserDescription,
  updateUserAvatar,
  logoutUser,
} from "../../api/user.api";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateDetails = async () => {
    try {
      setLoading(true);
      await updateUserDetails({ username, email, password });
      alert("Details updated successfully");
      setPassword("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      setLoading(true);
      await updateUserDescription(description);
      alert("Description updated successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update description");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatar) {
      return alert("Please select an image");
    }

    try {
      setLoading(true);
      await updateUserAvatar(avatar);
      alert("Avatar updated successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } catch (error) {
      alert("Logout failed");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:border-blue-500";
  const cardClass =
    "rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6";

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-black transition-colors duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Manage your account details, profile description and avatar.
        </p>
      </div>

      <div className="space-y-6">
        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Account Details
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="New Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="New Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button
              onClick={handleUpdateDetails}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Details
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Description
          </h3>
          <textarea
            rows={4}
            placeholder="Write something about yourself..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <button
            onClick={handleUpdateDescription}
            disabled={loading}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Description
          </button>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Avatar
          </h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:transition-colors"
          />
          <button
            onClick={handleUpdateAvatar}
            disabled={loading}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Avatar
          </button>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Session
          </h3>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
