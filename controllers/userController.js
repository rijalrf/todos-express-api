import { PrismaClient } from "@prisma/client";
import ApiError from "../utils/ApiError.js";
import sendSuccess from "../utils/responseHandler.js";

const prisma = new PrismaClient();

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    sendSuccess(res, 200, "success retrieve user list", users);
  } catch (error) {
    return next(new ApiError(500, "failed to get user list", error));
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id), // Pastikan id adalah integer
      },
    });

    if (user) {
      sendSuccess(res, 200, "success retrieve user", user);
    } else {
      return next(new ApiError(404, "user doesn't exist"));
    }
  } catch (error) {
    return next(new ApiError(500, "failed to get user", error));
  }
};
