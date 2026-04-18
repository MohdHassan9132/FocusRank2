import API from "./axios"

// DAILY
export const getDailyAnalytics = async () => {
  const res = await API.get("/users/analytics/daily")
  return res.data
}

// WEEKLY
export const getWeeklyAnalytics = async () => {
  const res = await API.get("/users/analytics/weekly")
  return res.data
}

// MONTHLY
export const getMonthlyAnalytics = async () => {
  const res = await API.get("/users/analytics/monthly")
  return res.data
}