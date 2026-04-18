// frontend/src/api/axios.js

import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true
})

/**
 * Request interceptor — automatically attach Authorization header
 * if an access token exists in localStorage.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
