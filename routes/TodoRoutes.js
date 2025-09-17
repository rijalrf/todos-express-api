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
  getAllTodoAndItems,
  updateTodoAndItems,
} from "../controllers/TodoControllers.js";

const router = express.Router();

router.get("/todos", auth, getTodos);
router.get("/todosanditems", auth, getAllTodoAndItems); // New route to get todos with their items
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
router.put("/todosItems/:id", auth, updateTodoAndItems, validate, createTodo);
router.delete("/todos/:id", auth, deleteTodo);

export default router;
