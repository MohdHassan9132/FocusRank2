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

export const updateUserDetails = (data) => {
  return API.patch("/users/update-details", data)
}

export const updateUserDescription = (description) => {
  return API.patch("/users/update-description", {
    description,
  })
}

export const updateUserAvatar = (avatarFile) => {
  const formData = new FormData()
  formData.append("avatar", avatarFile)

  return API.patch("/users/update-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const getCurrentUser = () => {
  return API.get("/users/get-current-user")
}
