import logger from "../middleware/logger.js";
import ApiError from "../utils/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { createToken, verifRefreshToken } from "../utils/jwt.js";
import sendSuccess from "../utils/responseHandler.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import { cryptoHash } from "../utils/cryptoHash.js";
import {
  logAuthSuccess,
  logAuthFailure,
  logUserAction,
  AUDIT_EVENTS,
} from "../utils/auditLogger.js";
import {
  recordFailedAttempt,
  resetFailedAttempts,
} from "../utils/accountLockout.js";

const prisma = new PrismaClient();

// ===== Helpers & constants
const COOKIE_NAME = "rt";
const isProd = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // only true in production (HTTPS)
  sameSite: "lax", // consider "strict" if compatible with your flow
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (align with refresh token expiry)
  path: "/auth/token", // keep cookie scoped to token endpoint
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { path: REFRESH_COOKIE_OPTIONS.path });
};

// ===== Controllers
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      select: { id: true, email: true, password: true },
      where: { email },
    });

    if (!user) {
      // Log failed attempt and record for account lockout
      logAuthFailure(req, email, "User not found");
      await recordFailedAttempt(email, req);
      return next(new ApiError(401, "email or password invalid"));
    }

    // Validate password
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      // Log failed attempt and record for account lockout
      logAuthFailure(req, email, "Invalid password");
      await recordFailedAttempt(email, req);
      return next(new ApiError(401, "email or password invalid"));
    }

    // Reset failed attempts on successful login
    await resetFailedAttempts(user.id);

    // Issue tokens
    const token = createToken(user.email, user.id);
    const rtHash = cryptoHash(token.refreshToken);

    // Persist refresh token hash
    await prisma.user.update({
      where: { id: user.id },
      data: {
        rtHash,
        rtExpiredAt: new Date(token.refreshExp * 1000),
      },
    });

    // Set httpOnly cookie for refresh token
    setRefreshCookie(res, token.refreshToken);

    // Log successful authentication
    logAuthSuccess(req, user);

    // Response body (do not expose refresh token in body when using httpOnly cookie)
    sendSuccess(res, 200, "login successfully", {
      access_token: token.accessToken,
      token_type: "Bearer",
      // Keeping original field name for backward compatibility
      expired_in: token.accessExp, // NOTE: this is a timestamp, not duration
    });
  } catch (error) {
    logAuthFailure(req, email, `Login error: ${error.message}`);
    return next(new ApiError(500, "failed to login", error));
  }
};

export const logout = async (req, res, next) => {
  try {
    // Use userId from authenticated context (requires authAPIKey middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return next(new ApiError(401, "User not authenticated"));
    }

    await prisma.user.update({
      data: { rtHash: null, rtExpiredAt: null },
      where: { id: userId },
    });

    clearRefreshCookie(res);

    // Log successful logout
    logUserAction(req, req.user, AUDIT_EVENTS.LOGOUT);

    sendSuccess(res, 200, "logout successfully");
  } catch (error) {
    return next(new ApiError(500, "logout failed", error));
  }
};

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({
      select: { id: true, email: true },
      where: { email },
    });

    if (existing) {
      logAuthFailure(req, email, "Email already registered");
      return next(new ApiError(409, "user already registered"));
    }

    const hashed = await hashPassword(password);

    const newUser = await prisma.user.create({
      select: { id: true, name: true, email: true },
      data: { name, email, password: hashed },
    });

    // Log successful registration
    logUserAction(req, newUser, AUDIT_EVENTS.REGISTER);

    sendSuccess(res, 201, "user registered successfully", newUser);
  } catch (error) {
    logAuthFailure(req, email, `Registration error: ${error.message}`);
    return next(new ApiError(500, "failed to register user", error));
  }
};

export const token = async (req, res, next) => {
  const { grant_type, refresh_token: bodyRefreshToken } = req.body;

  if (grant_type !== "refresh_token") {
    return next(new ApiError(400, "invalid grant_type"));
  }

  // Support both body and cookie-based refresh token
  // Priority: cookie > body (more secure)
  const refreshToken = req.cookies?.[COOKIE_NAME] || bodyRefreshToken;

  if (!refreshToken) {
    return next(new ApiError(401, "refresh token is required"));
  }

  const rtHash = cryptoHash(refreshToken);

  try {
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, rtHash: true },
      where: { rtHash },
    });

    if (!user) {
      logger.warn("refresh token hash not found");
      return next(new ApiError(404, "refresh token doesn't exist"));
    }

    const payload = verifRefreshToken(refreshToken);

    // Verify payload matches user
    if (payload.userId !== user.id) {
      logger.warn("token payload mismatch", {
        payloadUserId: payload.userId,
        dbUserId: user.id,
      });
      return next(new ApiError(401, "invalid refresh token"));
    }

    const newToken = createToken(payload.email, payload.userId);

    // IMPORTANT: store HASH, not raw token
    const updated = await prisma.user.update({
      data: {
        rtHash: cryptoHash(newToken.refreshToken),
        rtExpiredAt: new Date(newToken.refreshExp * 1000),
      },
      where: { id: user.id },
      select: { id: true },
    });

    if (!updated) {
      return next(new ApiError(500, "failed to create new token"));
    }

    // Always rotate cookie for consistency
    setRefreshCookie(res, newToken.refreshToken);

    // Log successful token refresh
    logUserAction(
      req,
      { id: user.id, email: user.email },
      AUDIT_EVENTS.TOKEN_REFRESH
    );

    const response = {
      access_token: newToken.accessToken,
      token_type: "Bearer",
      // Keeping original field name for backward compatibility
      expired_in: newToken.accessExp, // NOTE: this is a timestamp, not duration
    };

    // Only include refresh token in body if it was provided via body (backward compatibility)
    if (bodyRefreshToken) {
      response.refresh_token = newToken.refreshToken;
    }

    sendSuccess(res, 200, "token created successfully", response);
  } catch (error) {
    logAuthFailure(
      req,
      "unknown",
      `Token refresh error: ${error.message}`,
      AUDIT_EVENTS.TOKEN_REFRESH_FAILED
    );
    return next(new ApiError(500, "invalid to create token", error));
  }
};
