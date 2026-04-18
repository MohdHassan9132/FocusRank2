import API from "./axios"

/* ---------------- CREATE SESSION ---------------- */
export const createPomodoro = (time) => {
  return API.post("/pomodoro", { time })
}

/* ---------------- GET TODAY ---------------- */
export const getTodayPomodoro = () => {
  return API.get("/pomodoro/today")
}

/* ---------------- GET BY DATE ---------------- */
export const getPomodoroByDate = (date) => {
  return API.get(`/pomodoro/date/${date}`)
}

/* ---------------- GET WEEK ---------------- */
export const getWeeklyPomodoro = () => {
  return API.get("/pomodoro/week")
}