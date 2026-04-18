import API from "./axios"

/**
 * POST /todos
 */
export const createTodo = (todoData, accessToken) => {
  return API.post("/todos", todoData, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

/**
 * PATCH /todos/:todoId
 */
export const updateTodo = (todoId, updates, accessToken) => {
  return API.patch(`/todos/${todoId}`, updates, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

/**
 * DELETE /todos/:todoId
 */
export const deleteTodo = (todoId, accessToken) => {
  return API.delete(`/todos/${todoId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

/**
 * GET /todos/today
 */
export const getTodayTodos = (accessToken) => {
  return API.get("/todos/today", {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}

/**
 * GET /todos/date/:date
 */
export const getTodosByDate = (date, accessToken) => {
  return API.get(`/todos/date/${date}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
}