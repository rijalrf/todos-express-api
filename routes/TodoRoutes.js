import express from "express";
import {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/TodoControllers.js";

const router = express.Router();

router.get("/todos", getTodos);
router.post("/todos", createTodo);
router.get("/todos/:id", getTodoById);
router.put("/todos/:id", updateTodo);
router.delete("/todos/:id", deleteTodo);

export default router;
