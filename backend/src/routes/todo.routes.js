import { Router } from "express"
import { verifyJWT as protect } from "../middlewares/auth.middleware.js"
import {
  createTodo,
  updateTodo,
  getTodayTodos,
  getTodosByDate,
  deleteTodo  // Import the new function
} from "../controllers/todo.controller.js"

const router = Router()

router.post("/", protect, createTodo)
router.patch("/:todoId", protect, updateTodo)
router.delete("/:todoId", protect, deleteTodo)  // Add DELETE route
router.get("/today", protect, getTodayTodos)
router.get("/date/:date", protect, getTodosByDate)

export default router