// src/components/Settings.jsx

import { useState } from "react"
import {
  updateUserDetails,
  updateUserDescription,
  updateUserAvatar,
  logoutUser,
} from "../../api/user.api"

const Settings = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [description, setDescription] = useState("")
  const [avatar, setAvatar] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleUpdateDetails = async () => {
    try {
      setLoading(true)

      await updateUserDetails({
        username,
        email,
        password,
      })

      alert("Details updated successfully")
      setPassword("")
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update details")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDescription = async () => {
    try {
      setLoading(true)

      await updateUserDescription(description)

      alert("Description updated successfully")
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update description")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!avatar) {
      return alert("Please select an image")
    }

    try {
      setLoading(true)

      await updateUserAvatar(avatar)

      alert("Avatar updated successfully")
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update avatar")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      localStorage.removeItem("accessToken")
      window.location.href = "/login"
    } catch (error) {
      alert("Logout failed")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account details, profile description and avatar.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Account Details
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="New Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500"
            />

            <input
              type="email"
              placeholder="New Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500"
            />

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleUpdateDetails}
              disabled={loading}
              className="px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Update Details
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Description
          </h3>

          <textarea
            rows={4}
            placeholder="Write something about yourself..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 resize-none outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleUpdateDescription}
            disabled={loading}
            className="mt-4 px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Update Description
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Avatar
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
            className="block w-full text-sm text-slate-600
              file:mr-4 file:px-4 file:py-2
              file:rounded-lg file:border-0
              file:bg-indigo-600 file:text-white
              hover:file:bg-indigo-700"
          />

          <button
            onClick={handleUpdateAvatar}
            disabled={loading}
            className="mt-4 px-5 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Update Avatar
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Session</h3>

          <button
            onClick={handleLogout}
            className="px-5 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings