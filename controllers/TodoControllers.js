import { PrismaClient } from "@prisma/client";
import sendSuccess from "../utils/responseHandler.js";
import ApiError from "../utils/ApiError.js";
import logger from "../middleware/logger.js";

const prisma = new PrismaClient();

export const getTodos = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const totalData = await prisma.todo.count();
  const totalPages = Math.ceil(totalData / limit);
  const meta = {
    totalData: totalData,
    totalPages: totalPages,
    currentPage: page,
  };

  try {
    const response = await prisma.todo.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    });
    logger.info("success return data todo", {
      skip: offset,
      take: limit,
    });
    return sendSuccess(
      res,
      200,
      "Todos retrieved successfully",
      response,
      meta
    );
  } catch (error) {
    logger.error(error.message);
    return next(new ApiError(404, "internal server error"));
  }
};

export const getAllTodoAndItems = async (req, res, next) => {
  try {
    const response = await prisma.todo.findMany({
      include: { todoItems: true },
      orderBy: { id: "desc" },
    });
    return sendSuccess(
      res,
      200,
      "Todos and items retrieved successfully",
      response
    );
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const getTodoById = async (req, res, next) => {
  try {
    const response = await prisma.todo.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    if (!response) {
      return next(new ApiError(404, "Todo not found"));
    }
    return sendSuccess(res, 200, "Todo found", response);
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const createTodo = async (req, res, next) => {
  try {
    const response = await prisma.todo.create({
      data: {
        title: req.body.title,
        description: req.body.description,
      },
    });
    return sendSuccess(res, 201, "Todo created successfully", response);
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const response = await prisma.todo.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        title: req.body.title,
        description: req.body.description,
        completed: Boolean(req.body.completed),
      },
    });
    return sendSuccess(res, 200, "Todo updated successfully", response);
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    await prisma.todo.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    return sendSuccess(res, 200, "Todo deleted successfully");
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const updateStatusTodo = async (req, res, next) => {
  try {
    const response = await prisma.todo.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        completed: Boolean(req.body.completed),
      },
    });
    return sendSuccess(res, 200, "Todo status updated successfully", response);
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};

export const updateTodoAndItems = async (req, res, next) => {
  const { title, description, todoItems } = req.body;
  const todoId = parseInt(req.params.id);
  try {
    const response = await prisma.todo.update({
      where: { id: todoId },
      data: {
        title,
        description,
        todoItems: {
          deleteMany: {}, // Hapus semua item yang ada
          create: todoItems, // Tambahkan item baru dari request
        },
      },
    });
    return sendSuccess(
      res,
      200,
      "Todo and items updated successfully",
      response
    );
  } catch (error) {
    return next(new ApiError(500, "internal server error"));
  }
};
