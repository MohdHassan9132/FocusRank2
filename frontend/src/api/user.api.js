// frontend/src/api/user.api.js

import API from "./axios"

/**
 * POST /users/login
 */
export const loginUser = (email, password) => {
  return API.post("/users/login", { email, password })
}

/**
 * POST /users/signup
 */
export const signupUser = (email, password) => {
  return API.post("/users/signup", { email, password })
}

/**
 * POST /users/logout  (protected — token attached via interceptor)
 */
export const logoutUser = () => {
  return API.post("/users/logout")
}
