import express from "express";
import auth from "../middleware/auth.js";
import {
  getTodoValidationRules,
  validate,
} from "../middleware/TodoValidator.js";
import {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../controllers/TodoControllers.js";

const router = express.Router();

router.get("/todos", auth, getTodos);
router.post("/todos", auth, getTodoValidationRules, validate, createTodo);
router.get("/todos/:id", auth, getTodoById);
router.put("/todos/:id", auth, getTodoValidationRules, validate, updateTodo);
router.delete("/todos/:id", auth, deleteTodo);

export default router;
