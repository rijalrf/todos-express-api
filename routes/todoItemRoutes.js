import { Router } from "express";
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
} from "../middleware/TodoValidator.js";
import auth from "../middleware/authentication.js";

const router = Router();

router.get("/todos/:todoId/items", auth, getTodoItems);
router.post(
  "/todos/:todoId/items",
  auth,
  createOrUpdateTodoItemRules,
  validate,
  createTodoItem
);
router.put(
  "/todos/items/:id",
  auth,
  createOrUpdateTodoItemRules,
  validate,
  updateTodoItem
);
router.patch("/todos/items/:id", auth, updateStatusTodoItem);
router.delete("/todos/items/:id", auth, deleteTodoItem);

export default router;
