import { Router } from "express";
import { authAPIKey } from "../middleware/authentication.js";
import {
  createTodoItem,
  deleteTodoItem,
  getTodoItems,
  updateTodoItem,
  updateStatusTodoItem,
} from "../controllers/todoItemControlers.js";
import {
  createOrUpdateTodoItemRules,
  validate,
} from "../middleware/todoValidator.js";

const router = Router();

router.get("/todos/:todoId/items", authAPIKey, getTodoItems);
router.post(
  "/todos/:todoId/items",
  authAPIKey,
  createOrUpdateTodoItemRules,
  validate,
  createTodoItem
);
router.put(
  "/todos/items/:id",
  authAPIKey,
  createOrUpdateTodoItemRules,
  validate,
  updateTodoItem
);
router.patch("/todos/items/:id", authAPIKey, updateStatusTodoItem);
router.delete("/todos/items/:id", authAPIKey, deleteTodoItem);

export default router;
