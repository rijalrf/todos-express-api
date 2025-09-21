import logger from "../middleware/logger.js";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { createToken, verifRefreshToken } from "../utils/jwt.js";
import sendSuccess from "../utils/responseHandler.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { cryptoHash } from "../utils/cryptoHash.js";

const prisma = new PrismaClient();

export const login = async (req, res, next) => {
  // ambil value body
  const { email, password } = req.body;

  try {
    // cari user dengan email credential
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
    //jika tidak ada data usernya kirim error
    if (!user) {
      return next(
        new ApiError(
          401,
          "email or password invalid, please check and try again"
        )
      );
    }

    // validasi password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return next(
        new ApiError(
          401,
          "email or password invalid, please check and try again"
        )
      );
    }

    // buat token
    const token = createToken(user.email, user.id);
    const rtHash = cryptoHash(token.refreshToken);

    // insert token ke db
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        rtHash: rtHash,
        rtExpiredAt: new Date(token.refreshExp * 1000),
      },
    });

    // kirim cookie
    res.cookie("rt", token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/token",
    });

    //kirim response body
    sendSuccess(res, 200, "login successfully", {
      access_token: token.accessToken,
      token_type: "Bearer",
      expired_in: token.accessExp,
    });
  } catch (error) {
    return next(new ApiError(500, "email or password invalid", error));
  }
};

export const logout = async (req, res, next) => {
  const { userId } = req.body;
  try {
    await prisma.user.update({
      data: {
        rtHash: null,
        rtExpiredAt: null,
      },
      where: {
        id: userId,
      },
    });
    res.clearCookie("rt", { path: "/auth/token" });
    sendSuccess(res, 200, "logout successfully");
  } catch (error) {
    return next(new ApiError(500, "invalid process logout", error));
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
    return next(new ApiError(409, "user already registered"));
  }
  const hash = await hashPassword(password);
  try {
    const newUser = await prisma.user.create({
      select: {
        id: true,
        name: true,
        email: true,
      },
      data: {
        name: name,
        email: email,
        password: hash,
      },
    });
    sendSuccess(res, 201, "user registered successfully", newUser);
  } catch (error) {
    return next(new ApiError(500, "failed to register user", error));
  }
};

export const token = async (req, res, next) => {
  // get req body
  const { grant_type, refresh_token } = req.body;

  //validate grant_type
  if (grant_type !== "refresh_token") {
    return next(new ApiError(401, "unauthorization"));
  }

  const rtHash = cryptoHash(refresh_token);
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        rtHash: true,
      },
      where: {
        rtHash: rtHash,
      },
    });
    if (!user) {
      logger.error(`user tidak di temukan dari refresh token yg di berikan`);
      return next(new ApiError(404, "refresh token doesn't exist"));
    }

    const playload = verifRefreshToken(refresh_token);
    const newToken = createToken(playload.email, playload.userId);
    const updateUser = await prisma.user.update({
      data: {
        rtHash: newToken.refreshToken,
        rtExpiredAt: new Date(newToken.refreshExp * 1000),
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
    return next(new ApiError(500, "invalid to create token", error));
  }
};
