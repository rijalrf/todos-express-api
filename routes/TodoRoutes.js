import express from "express";
import auth from "../middleware/authentication.js";
import {
  createOrUpdateTodoRules,
  updateStatusTodoRules,
  validate,
} from "../middleware/TodoValidator.js";
import {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
  updateStatusTodo,
} from "../controllers/TodoControllers.js";

const router = express.Router();

router.get("/todos", auth, getTodos);
router.post("/todos", auth, createOrUpdateTodoRules, validate, createTodo);
router.get("/todos/:id", auth, getTodoById);
router.put("/todos/:id", auth, createOrUpdateTodoRules, validate, updateTodo);
router.patch(
  "/todos/:id",
  auth,
  updateStatusTodoRules,
  validate,
  updateStatusTodo
);
router.delete("/todos/:id", auth, deleteTodo);

export default router;
