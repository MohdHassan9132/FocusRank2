// backend/src/controllers/todo.controller.js

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Todo } from "../models/todo.model.js"

/**
 * POST /api/v1/todos
 * Body: { task, date? }
 */
/**
 * POST /api/v1/todos
 * Body: { task, date? }
 */
export const createTodo = asyncHandler(async (req, res) => {
  const { task, date } = req.body

  if (!task?.trim()) {
    throw new ApiError(400, "task is required")
  }

  const todo = await Todo.create({
    user: req.user._id,
    task: task.trim(),
    date: date ? new Date(date) : Date.now() // Use provided date or default to now
  })

  return res
    .status(201)
    .json(new ApiResponse(201, todo, "Todo created successfully"))
})

/**
 * PATCH /api/v1/todos/:todoId
 * Body: { task?, isCompleted?, date? }
 */
export const updateTodo = asyncHandler(async (req, res) => {
  const { todoId } = req.params
  const { task, isCompleted, date } = req.body

  const todo = await Todo.findOne({ _id: todoId, user: req.user._id })

  if (!todo) {
    throw new ApiError(404, "Todo not found")
  }

  if (task !== undefined) todo.task = task.trim()
  if (isCompleted !== undefined) todo.isCompleted = isCompleted
  if (date !== undefined) todo.date = date

  await todo.save()

  return res
    .status(200)
    .json(new ApiResponse(200, todo, "Todo updated successfully"))
})

/**
 * GET /api/v1/todos/today
 */
export const getTodayTodos = asyncHandler(async (req, res) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const todos = await Todo.find({
    user: req.user._id,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, todos, "Today's todos fetched successfully"))
})

/**
 * GET /api/v1/todos/date/:date
 * Example: /api/v1/todos/date/2026-04-18
 */
export const getTodosByDate = asyncHandler(async (req, res) => {
  const { date } = req.params

  const start = new Date(date + "T00:00:00")
  const end = new Date(date + "T23:59:59.999")

  if (isNaN(start.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD")
  }

  const todos = await Todo.find({
    user: req.user._id,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, todos, "Todos fetched successfully"))
})


/**
 * DELETE /api/v1/todos/:todoId
 */
export const deleteTodo = asyncHandler(async (req, res) => {
  const { todoId } = req.params

  const todo = await Todo.findOneAndDelete({ 
    _id: todoId, 
    user: req.user._id 
  })

  if (!todo) {
    throw new ApiError(404, "Todo not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, todo, "Todo deleted successfully"))
})