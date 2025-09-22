import crypto from "crypto";
import logger from "./logger.js";
import { logSecurityEvent, AUDIT_EVENTS } from "../utils/auditLogger.js";

/**
 * Simple CSRF Protection Middleware
 * 
 * NOTE: This is a basic implementation. For production, consider using
 * a dedicated library like 'csurf' or similar.
 * 
 * This implementation provides:
 * - CSRF token generation and validation
 * - Double submit cookie pattern
 * - Proper logging of CSRF attacks
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure random token
 * @returns {string} CSRF token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
};

/**
 * Set CSRF token in cookie and make it available to client
 * @param {Object} res - Express response object
 * @param {string} token - CSRF token
 */
const setCSRFCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be accessible to JavaScript for CSRF protection
    secure: isProd,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
};

/**
 * Create CSRF protection middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export const createCSRFProtection = (options = {}) => {
  const config = {
    ignoreMethods: ["GET", "HEAD", "OPTIONS"],
    tokenHeader: CSRF_HEADER_NAME,
    tokenCookie: CSRF_COOKIE_NAME,
    onError: (req, res) => {
      logSecurityEvent(req, AUDIT_EVENTS.CSRF_ATTACK, {
        providedToken: req.get(config.tokenHeader),
        cookieToken: req.cookies?.[config.tokenCookie],
      });
      
      res.status(403).json({
        success: false,
        error: "CSRF token validation failed",
        message: "Invalid or missing CSRF token",
      });
    },
    ...options,
  };

  return (req, res, next) => {
    // Skip CSRF protection for safe methods
    if (config.ignoreMethods.includes(req.method)) {
      // Generate and set CSRF token for safe methods (like GET)
      const token = generateCSRFToken();
      setCSRFCookie(res, token);
      
      // Make token available to client via header as well
      res.set("X-CSRF-Token", token);
      
      return next();
    }

    // Validate CSRF token for unsafe methods (POST, PUT, DELETE, etc.)
    const tokenFromHeader = req.get(config.tokenHeader);
    const tokenFromCookie = req.cookies?.[config.tokenCookie];

    if (!tokenFromHeader || !tokenFromCookie) {
      logger.warn("CSRF token missing", {
        method: req.method,
        url: req.originalUrl,
        hasHeader: !!tokenFromHeader,
        hasCookie: !!tokenFromCookie,
      });
      
      return config.onError(req, res);
    }

    // Use constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(tokenFromHeader, "hex"),
      Buffer.from(tokenFromCookie, "hex")
    )) {
      logger.warn("CSRF token mismatch", {
        method: req.method,
        url: req.originalUrl,
        headerToken: tokenFromHeader.substring(0, 8) + "...",
        cookieToken: tokenFromCookie.substring(0, 8) + "...",
      });
      
      return config.onError(req, res);
    }

    // CSRF token is valid, generate new one for next request
    const newToken = generateCSRFToken();
    setCSRFCookie(res, newToken);
    res.set("X-CSRF-Token", newToken);

    next();
  };
};

/**
 * Simple CSRF middleware for basic protection
 * Use this for applications that don't need full CSRF protection
 */
export const basicCSRFProtection = createCSRFProtection();

/**
 * Middleware to skip CSRF protection for API endpoints
 * Use this for endpoints that are consumed by external APIs
 */
export const skipCSRF = (req, res, next) => {
  req.skipCSRF = true;
  next();
};

/**
 * Get CSRF token endpoint - allows clients to retrieve CSRF token
 * Mount this at GET /csrf-token or similar
 */
export const getCSRFToken = (req, res) => {
  const token = generateCSRFToken();
  setCSRFCookie(res, token);
  
  res.json({
    success: true,
    csrfToken: token,
    message: "CSRF token generated successfully",
  });
};

/**
 * Enhanced CSRF protection with additional security measures
 */
export const enhancedCSRFProtection = createCSRFProtection({
  // Additional validation: check Origin header
  onError: (req, res) => {
    const origin = req.get("Origin");
    const referer = req.get("Referer");
    const host = req.get("Host");
    
    logSecurityEvent(req, AUDIT_EVENTS.CSRF_ATTACK, {
      providedToken: req.get(CSRF_HEADER_NAME)?.substring(0, 8) + "...",
      cookieToken: req.cookies?.[CSRF_COOKIE_NAME]?.substring(0, 8) + "...",
      origin,
      referer,
      host,
    });
    
    res.status(403).json({
      success: false,
      error: "CSRF token validation failed",
      message: "Invalid or missing CSRF token",
    });
  },
});

export default {
  createCSRFProtection,
  basicCSRFProtection,
  enhancedCSRFProtection,
  skipCSRF,
  getCSRFToken,
};