// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react"
import { loginUser, signupUser, logoutUser } from "../api/user.api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user && !!accessToken

  /* ──── Restore from localStorage on mount ──── */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("accessToken")
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setAccessToken(storedToken)
      }
    } catch {
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
    } finally {
      setLoading(false)
    }
  }, [])

  /* ──── Persist helpers ──── */
  const persistAuth = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("accessToken", token)
    setUser(userData)
    setAccessToken(token)
  }

  const clearAuth = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    setUser(null)
    setAccessToken(null)
  }

  /* ──── Auth actions ──── */

  /**
   * Login with email & password.
   * Persists user + accessToken in state and localStorage.
   */
  const login = async (email, password) => {
    const res = await loginUser(email, password)
    // Backend shape: { data: { user, accessToken, refreshToken }, message }
    const { user: userData, accessToken: token } = res.data.data
    persistAuth(userData, token)
    return res
  }

  /**
   * Signup with email & password.
   * After successful signup, auto-logs in and returns login response.
   */
  const signup = async (email, password) => {
    await signupUser(email, password)
    // Auto-login after signup so user lands on /dashboard directly
    const loginRes = await loginUser(email, password)
    const { user: userData, accessToken: token } = loginRes.data.data
    persistAuth(userData, token)
    return loginRes
  }

  /**
   * Logout — clears server cookies + local state.
   */
  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // Even if the server call fails, clear local state
    }
    clearAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
