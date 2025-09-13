import { PrismaClient } from "@prisma/client";
import sendSuccess from "../utils/responseHandler.js";
import ApiError from "../utils/ApiError.js";

const prisma = new PrismaClient();

export const getTodoItems = async (req, res, next) => {
  try {
    const todoId = parseInt(req.params.todoId);
    const response = await prisma.todoItem.findMany({
      where: { todoId: todoId },
    });
    return sendSuccess(res, 200, "Todo items retrieved successfully", response);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const createTodoItem = async (req, res, next) => {
  try {
    const todoId = parseInt(req.params.todoId);
    const response = await prisma.todoItem.create({
      data: {
        todoId: todoId,
        title: req.body.title,
        description: req.body.description,
      },
    });
    return sendSuccess(res, 201, "Todo item created successfully", response);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const updateTodoItem = async (req, res, next) => {
  try {
    const response = await prisma.todoItem.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        title: req.body.title,
        description: req.body.description,
        completed: Boolean(req.body.completed),
      },
    });
    return sendSuccess(res, 200, "Todo item updated successfully", response);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const deleteTodoItem = async (req, res, next) => {
  try {
    await prisma.todoItem.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    return sendSuccess(res, 200, "Todo item deleted successfully");
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

export const updateStatusTodoItem = async (req, res, next) => {
  try {
    const response = await prisma.todoItem.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        completed: Boolean(req.body.completed),
      },
    });
    return sendSuccess(
      res,
      200,
      "Todo item status updated successfully",
      response
    );
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
