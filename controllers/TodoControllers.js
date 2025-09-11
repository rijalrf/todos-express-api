import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTodos = async (req, res) => {
  try {
    const response = await prisma.todo.findMany();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodoById = async (req, res) => {
  try {
    const response = await prisma.todo.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const response = await prisma.todo.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
