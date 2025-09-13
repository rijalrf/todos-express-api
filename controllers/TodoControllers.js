import { PrismaClient } from "@prisma/client";
import { body, param, validationResult } from "express-validator";

const prisma = new PrismaClient();

export const getTodos = async (req, res) => {
  try {
    const response = await prisma.todo.findMany();
    // If data is found, return it with a 200 status
    res.status(200).json({
      sucess: true,
      message: "successfully retrieved data",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      error: error.message,
      data: null,
    });
  }
};

export const getTodoById = async (req, res) => {
  try {
    const response = await prisma.todo.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    // Check if response is null (not found)
    if (!response) {
      return res.status(404).json({
        sucess: false,
        error: "Todo not found",
      });
    }
    res.status(200).json({
      sucess: true,
      message: "Todo found",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      error: error.message,
    });
  }
};

export const createTodo = async (req, res) => {
  try {
    const response = await prisma.todo.create({
      data: {
        title: req.body.title,
        description: req.body.description,
      },
    });
    res.status(201).json({
      sucess: true,
      message: "Todo created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      error: error.message,
    });
  }
};

export const updateTodo = async (req, res) => {
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
    res.status(200).json({
      sucess: true,
      message: "Todo updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      error: error.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const response = await prisma.todo.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json({
      sucess: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      error: error.message,
    });
  }
};
