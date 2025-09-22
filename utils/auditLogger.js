import logger from "../middleware/logger.js";

/**
 * Audit Logger for Security Events
 * Logs authentication and security-related events with proper context
 */

// Security event types
export const AUDIT_EVENTS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  TOKEN_REFRESH: "TOKEN_REFRESH",
  TOKEN_REFRESH_FAILED: "TOKEN_REFRESH_FAILED",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  CSRF_ATTACK: "CSRF_ATTACK",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};

/**
 * Extract request metadata for audit logging
 * @param {Object} req - Express request object
 * @returns {Object} Request metadata
 */
const getRequestMetadata = (req) => {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    sessionId: req.sessionID,
    // Forward headers for proxy scenarios
    forwardedFor: req.get("X-Forwarded-For"),
    realIP: req.get("X-Real-IP"),
  };
};

/**
 * Log authentication success events
 * @param {Object} req - Express request object
 * @param {Object} user - User object
 * @param {string} eventType - Type of auth event
 */
export const logAuthSuccess = (req, user, eventType = AUDIT_EVENTS.LOGIN_SUCCESS) => {
  const metadata = getRequestMetadata(req);
  
  logger.info(`Authentication Success - ${eventType}`, {
    event: eventType,
    userId: user.id,
    email: user.email,
    ...metadata,
  });
};

/**
 * Log authentication failure events
 * @param {Object} req - Express request object
 * @param {string} email - Attempted email
 * @param {string} reason - Failure reason
 * @param {string} eventType - Type of auth event
 */
export const logAuthFailure = (req, email, reason, eventType = AUDIT_EVENTS.LOGIN_FAILED) => {
  const metadata = getRequestMetadata(req);
  
  logger.warn(`Authentication Failed - ${eventType}`, {
    event: eventType,
    email: email || "unknown",
    reason,
    ...metadata,
  });
};

/**
 * Log security events (unauthorized access, suspicious activity)
 * @param {Object} req - Express request object
 * @param {string} eventType - Security event type
 * @param {Object} additionalData - Additional event data
 */
export const logSecurityEvent = (req, eventType, additionalData = {}) => {
  const metadata = getRequestMetadata(req);
  
  logger.error(`Security Event - ${eventType}`, {
    event: eventType,
    ...additionalData,
    ...metadata,
  });
};

/**
 * Log user actions (logout, token refresh, etc.)
 * @param {Object} req - Express request object  
 * @param {Object} user - User object
 * @param {string} eventType - Action type
 * @param {Object} additionalData - Additional action data
 */
export const logUserAction = (req, user, eventType, additionalData = {}) => {
  const metadata = getRequestMetadata(req);
  
  logger.info(`User Action - ${eventType}`, {
    event: eventType,
    userId: user?.id,
    email: user?.email,
    ...additionalData,
    ...metadata,
  });
};

/**
 * Log rate limiting events
 * @param {Object} req - Express request object
 * @param {string} limit - Rate limit info
 */
export const logRateLimitExceeded = (req, limit) => {
  const metadata = getRequestMetadata(req);
  
  logger.warn(`Rate Limit Exceeded`, {
    event: AUDIT_EVENTS.RATE_LIMIT_EXCEEDED,
    limit,
    ...metadata,
  });
};

/**
 * Log account lockout events
 * @param {Object} req - Express request object
 * @param {string} email - User email
 * @param {number} failedAttempts - Number of failed attempts
 */
export const logAccountLockout = (req, email, failedAttempts) => {
  const metadata = getRequestMetadata(req);
  
  logger.error(`Account Locked`, {
    event: AUDIT_EVENTS.ACCOUNT_LOCKED,
    email,
    failedAttempts,
    ...metadata,
  });
};

/**
 * Create audit middleware for automatic request logging
 * @param {string} eventType - Event type to log
 * @returns {Function} Express middleware
 */
export const createAuditMiddleware = (eventType) => {
  return (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log based on response status
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (req.user) {
          logUserAction(req, req.user, eventType, { responseStatus: res.statusCode });
        } else {
          logger.info(`API Success - ${eventType}`, {
            event: eventType,
            responseStatus: res.statusCode,
            ...getRequestMetadata(req),
          });
        }
      } else if (res.statusCode >= 400) {
        logSecurityEvent(req, eventType, { 
          responseStatus: res.statusCode,
          errorData: data 
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to log suspicious activity patterns
 */
export const suspiciousActivityDetector = (req, res, next) => {
  const metadata = getRequestMetadata(req);
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    // SQL injection attempts in body
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDROP\b|\bDELETE\b)/i,
    // XSS attempts
    /<script|javascript:|onclick|onerror/i,
    // Path traversal
    /\.\.\/|\.\.\\/i,
  ];
  
  const bodyString = JSON.stringify(req.body || {});
  const queryString = JSON.stringify(req.query || {});
  const combinedInput = `${bodyString} ${queryString} ${req.originalUrl}`;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combinedInput)) {
      logSecurityEvent(req, AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
        pattern: pattern.toString(),
        input: combinedInput.substring(0, 500), // Limit log size
      });
      break;
    }
  }
  
  next();
};

export default {
  AUDIT_EVENTS,
  logAuthSuccess,
  logAuthFailure,
  logSecurityEvent,
  logUserAction,
  logRateLimitExceeded,
  logAccountLockout,
  createAuditMiddleware,
  suspiciousActivityDetector,
};