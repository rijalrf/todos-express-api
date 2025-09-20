import express from "express";
import { authAPIKey } from "../middleware/authentication.js";
import {
  createOrUpdateTodoRules,
  updateStatusTodoRules,
  validate,
} from "../middleware/todoValidator.js";
import {
  getTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
  updateStatusTodo,
  getAllTodoAndItems,
  updateTodoAndItems,
} from "../controllers/todoControllers.js";

const router = express.Router();

router.get("/todos", authAPIKey, getTodos);
router.get("/todosanditems", authAPIKey, getAllTodoAndItems); // New route to get todos with their items
router.post(
  "/todos",
  authAPIKey,
  createOrUpdateTodoRules,
  validate,
  createTodo
);
router.get("/todos/:id", authAPIKey, getTodoById);
router.put(
  "/todos/:id",
  authAPIKey,
  createOrUpdateTodoRules,
  validate,
  updateTodo
);
router.patch(
  "/todos/:id",
  authAPIKey,
  updateStatusTodoRules,
  validate,
  updateStatusTodo
);
router.put(
  "/todosItems/:id",
  authAPIKey,
  updateTodoAndItems,
  validate,
  createTodo
);
router.delete("/todos/:id", authAPIKey, deleteTodo);

export default router;
