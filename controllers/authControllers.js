import logger from "../middleware/logger.js";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { createToken, decodeToken, verifRefreshToken } from "../utils/jwt.js";
import sendSuccess from "../utils/responseHandler.js";
import { comparePasswod, hashPassword } from "../utils/passwordUtils.js";

const prisma = new PrismaClient();

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        password: true,
      },
      where: {
        email: email,
      },
    });
    if (!user) {
      return next(
        new ApiError(
          401,
          "email or password invalid, please check and try again"
        )
      );
    }

    const validPassword = await comparePasswod(password, user.password);
    if (!validPassword) {
      return next(
        new ApiError(
          401,
          "email or password invalid, please check and try again"
        )
      );
    }
    const token = createToken(user.email, user.id);
    const refreshToken = token.refreshToken;

    const updateUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
    if (!updateUser) {
      return next(new ApiError("terjadi kesalahan saat login"));
    }
    sendSuccess(res, 200, "login successfully", {
      access_token: token.accessToken,
      refresh_token2: refreshToken,
      token_type: "Bearer",
      expired_in: token.accessExp,
      refresh_token: refreshToken,
      updateUser: updateUser,
    });
  } catch (error) {
    logger.error("gagal membuat token", {
      email: email,
      error: error.message,
    });
    new ApiError(500, "gagal membuat token", error);
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
    select: {
      id: true,
      email: true,
    },
    where: {
      email: email,
    },
  });
  if (userRegister) {
    logger.error(`user dengan email ${email}, sudah di gunakan`);
    return next(new ApiError(409, "user email sudah di gunakan"));
  }
  const hash = await hashPassword(password);
  const refreshToken = createToken(email);
  try {
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hash,
        refreshToken: refreshToken.refreshToken,
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
  // get req body
  const { grant_type, refresh_token } = req.body;

  //validate grant_type
  if (grant_type !== "refresh_token") {
    return next(new ApiError(401, "unauthorization"));
  }

  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        refreshToken: true,
      },
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
        refreshToken: newToken.refreshToken,
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
    const response = {
      access_token: newToken.accessToken,
      token_type: "Bearer",
      expired_in: newToken.accessExp,
      refresh_token: newToken.refreshToken,
    };
    sendSuccess(res, 200, "token created successfully", response);
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
