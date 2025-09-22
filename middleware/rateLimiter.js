import rateLimit from "express-rate-limit";
import logger from "./logger.js";

/**
 * Rate limiting configurations for different auth endpoints
 */

// General auth rate limiter - for login and register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts",
    message: "Please try again after 15 minutes",
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn("Rate limit exceeded for auth endpoint", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.path,
    });
    
    res.status(429).json({
      success: false,
      error: "Too many authentication attempts",
      message: "Please try again after 15 minutes",
      retryAfter: 15 * 60,
    });
  },
});

// Strict rate limiter for password reset and sensitive operations
export const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: {
    error: "Too many sensitive operation attempts",
    message: "Please try again after 1 hour",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Strict rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      endpoint: req.path,
    });
    
    res.status(429).json({
      success: false,
      error: "Too many sensitive operation attempts",
      message: "Please try again after 1 hour",
      retryAfter: 60 * 60,
    });
  },
});

// Token refresh rate limiter - more permissive but still controlled
export const tokenRefreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 token refresh per 5 minutes
  message: {
    error: "Too many token refresh attempts",
    message: "Please try again after 5 minutes",
    retryAfter: 5 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Token refresh rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    
    res.status(429).json({
      success: false,
      error: "Too many token refresh attempts",
      message: "Please try again after 5 minutes",
      retryAfter: 5 * 60,
    });
  },
});

// Create a custom rate limiter with memory store for development
// In production, consider using Redis store for better scalability
export const createCustomRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // default limit
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  };

  return rateLimit({ ...defaultOptions, ...options });
};