import logger from "../middleware/logger.js";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import { createRefreshToken, createToken } from "../utils/createToken.js";
import sendSuccess from "../utils/responseHandler.js";

const prisma = new PrismaClient();

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      logger.info(`user dengan ${email}, tidak di temukan`);
      return next(new ApiError(409, "email tidak di temukan"));
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return next(new ApiError(404, "pasword tidak cocok"));
    }
    const jwt = createToken(user.email, user.id);
    const updateUser = await prisma.user.update({
      data: {
        refreshToken: jwt.refresh_token,
      },
      where: {
        email: email,
      },
    });
    if (!updateUser) {
      return next(new ApiError("terjadi kesalahan saat login"));
    }
    sendSuccess(res, 200, "login successfully", jwt);
  } catch (error) {
    logger.error("gagal membuat token", {
      email: email,
    });
    new ApiError(500, "gagal membuat token");
  }
};

export const logout = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const userLogout = await prisma.user.update({
      data: {
        refreshToken: null,
      },
      where: {
        id: userId,
      },
    });
    if (!userLogout) {
      return next(new ApiError(500, "terjadi kesalahan saat proses logout"));
    }
    sendSuccess(res, 200, "logout successfully");
  } catch (error) {
    logger.error("terjadi error saat logout", {
      error_exception: error.message,
    });
    return next(new ApiError(500, "terjadi kesalahan saat logout"));
  }
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const userRegister = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (userRegister) {
    logger.error(`user dengan email ${email}, sudah di gunakan`);
    return next(new ApiError(409, "user email sudah di gunakan"));
  }
  const hash = await hashPassword(password);
  const refreshToken = createRefreshToken(email);
  console.log({ hash });
  console.log({ refreshToken });
  try {
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hash,
        refreshToken: refreshToken,
      },
    });
    sendSuccess(res, 201, "user registered successfully", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    return next(new ApiError(500, "gagal untuk create user"));
  }
};

export const newToken = async (req, res, next) => {
  const { grant_type, refresh_token } = req.body;
  if (grant_type !== "refresh_token") {
    logger.error(`invalid grant_type pada ${grant_type}`);
    return next(new ApiError(404, "invalid grant_type"));
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refresh_token,
      },
    });
    if (!user) {
      logger.error(`user tidak di temukan dari refresh token yg di berikan`);
      return next(new ApiError(404, "refresh token doesn't exist"));
    }
    const newToken = createToken(user.email, user.id);
    const updateUser = await prisma.user.update({
      data: {
        refreshToken: newToken.refresh_token,
      },
      where: {
        id: user.id,
      },
    });
    if (!updateUser) {
      return next(
        new ApiError(500, "terjadi kesalahan saat mmebuat token baru")
      );
    }
    sendSuccess(res, 200, "token created successfully", newToken);
  } catch (error) {
    logger.error(
      "terjadi kesalahan saat memuat token baru, exception : " + error.message
    );
    return next(
      new ApiError(
        500,
        "gagal membuat token baru, error exception " + error.message
      )
    );
  }
};
