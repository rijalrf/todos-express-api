import { PrismaClient } from "@prisma/client";
import logger from "../middleware/logger.js";
import { logAccountLockout, logSecurityEvent, AUDIT_EVENTS } from "./auditLogger.js";

const prisma = new PrismaClient();

// Configuration for account lockout
const LOCKOUT_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5, // Lock after 5 failed attempts
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
  SLIDING_WINDOW: 15 * 60 * 1000, // 15 minutes sliding window for attempts
};

/**
 * Check if an account is currently locked
 * @param {string} email - User email
 * @returns {Promise<Object>} Lockout status
 */
export const isAccountLocked = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        lockedUntil: true,
        failedLoginAttempts: true,
        lastFailedLogin: true,
      },
      where: { email },
    });

    if (!user) {
      return { isLocked: false, user: null };
    }

    // Check if account is currently locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return {
        isLocked: true,
        user,
        remainingTime,
        reason: "Account temporarily locked due to multiple failed login attempts",
      };
    }

    // If lockout period has expired, reset the failed attempts
    if (user.lockedUntil && new Date() >= user.lockedUntil) {
      await resetFailedAttempts(user.id);
      return { isLocked: false, user: { ...user, failedLoginAttempts: 0, lockedUntil: null } };
    }

    return { isLocked: false, user };
  } catch (error) {
    logger.error("Error checking account lockout status", { email, error });
    // In case of error, allow access (fail open) but log the issue
    return { isLocked: false, user: null, error: true };
  }
};

/**
 * Record a failed login attempt
 * @param {string} email - User email
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Updated lockout status
 */
export const recordFailedAttempt = async (email, req) => {
  try {
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        lastFailedLogin: true,
        lockedUntil: true,
      },
      where: { email },
    });

    if (!user) {
      // User doesn't exist, but still log the attempt for security
      logSecurityEvent(req, AUDIT_EVENTS.LOGIN_FAILED, {
        email,
        reason: "User not found",
      });
      return { shouldLock: false };
    }

    const now = new Date();
    const slidingWindowStart = new Date(now.getTime() - LOCKOUT_CONFIG.SLIDING_WINDOW);
    
    let failedAttempts = user.failedLoginAttempts || 0;

    // If last failed login is outside the sliding window, reset the counter
    if (!user.lastFailedLogin || user.lastFailedLogin < slidingWindowStart) {
      failedAttempts = 1;
    } else {
      failedAttempts += 1;
    }

    const shouldLock = failedAttempts >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock ? new Date(now.getTime() + LOCKOUT_CONFIG.LOCKOUT_DURATION) : null;

    // Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: now,
        lockedUntil: lockedUntil,
      },
    });

    if (shouldLock) {
      logAccountLockout(req, email, failedAttempts);
      logger.warn(`Account locked for user: ${email}`, {
        failedAttempts,
        lockedUntil,
        userId: user.id,
      });
    } else {
      logger.warn(`Failed login attempt recorded`, {
        email,
        failedAttempts,
        attemptsRemaining: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS - failedAttempts,
      });
    }

    return {
      shouldLock,
      failedAttempts,
      attemptsRemaining: LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS - failedAttempts,
      lockedUntil,
    };
  } catch (error) {
    logger.error("Error recording failed login attempt", { email, error });
    return { shouldLock: false, error: true };
  }
};

/**
 * Reset failed login attempts (called after successful login)
 * @param {number} userId - User ID
 */
export const resetFailedAttempts = async (userId) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
      },
    });

    logger.info(`Failed login attempts reset for user ID: ${userId}`);
  } catch (error) {
    logger.error("Error resetting failed login attempts", { userId, error });
  }
};

/**
 * Get lockout statistics for monitoring
 * @returns {Promise<Object>} Lockout statistics
 */
export const getLockoutStats = async () => {
  try {
    const now = new Date();
    
    // Count currently locked accounts
    const lockedAccounts = await prisma.user.count({
      where: {
        lockedUntil: {
          gt: now,
        },
      },
    });

    // Count accounts with recent failed attempts
    const recentFailures = await prisma.user.count({
      where: {
        failedLoginAttempts: {
          gt: 0,
        },
        lastFailedLogin: {
          gte: new Date(now.getTime() - LOCKOUT_CONFIG.SLIDING_WINDOW),
        },
      },
    });

    return {
      currentlyLocked: lockedAccounts,
      recentFailures,
      config: LOCKOUT_CONFIG,
    };
  } catch (error) {
    logger.error("Error getting lockout statistics", { error });
    return null;
  }
};

/**
 * Manually unlock an account (admin function)
 * @param {string} email - User email
 * @param {string} adminUserId - Admin user ID performing the unlock
 * @returns {Promise<boolean>} Success status
 */
export const unlockAccount = async (email, adminUserId) => {
  try {
    const result = await prisma.user.updateMany({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null,
      },
    });

    if (result.count > 0) {
      logger.info(`Account manually unlocked`, {
        email,
        adminUserId,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Error manually unlocking account", { email, adminUserId, error });
    return false;
  }
};

/**
 * Create middleware to check for account lockout
 * @returns {Function} Express middleware
 */
export const createAccountLockoutMiddleware = () => {
  return async (req, res, next) => {
    // Only apply to login attempts
    if (req.path !== "/login" || req.method !== "POST") {
      return next();
    }

    const { email } = req.body;
    if (!email) {
      return next(); // Let the validation middleware handle missing email
    }

    try {
      const lockoutStatus = await isAccountLocked(email);
      
      if (lockoutStatus.isLocked) {
        logSecurityEvent(req, AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
          email,
          reason: "Account locked",
          remainingTime: lockoutStatus.remainingTime,
        });

        return res.status(423).json({
          success: false,
          error: "Account locked",
          message: lockoutStatus.reason,
          remainingTime: lockoutStatus.remainingTime,
          retryAfter: lockoutStatus.remainingTime * 60, // Convert to seconds
        });
      }

      // Store lockout status in request for use in login controller
      req.lockoutStatus = lockoutStatus;
      next();
    } catch (error) {
      logger.error("Account lockout middleware error", { email, error });
      // Continue with login process if lockout check fails (fail open)
      next();
    }
  };
};

export default {
  isAccountLocked,
  recordFailedAttempt,
  resetFailedAttempts,
  getLockoutStats,
  unlockAccount,
  createAccountLockoutMiddleware,
  LOCKOUT_CONFIG,
};