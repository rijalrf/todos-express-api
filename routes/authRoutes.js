import express from "express";
import {
  login,
  logout,
  token,
  register,
} from "../controllers/authControllers.js";
import {
  loginValidator,
  refreshTokenValidator,
  registerValidator,
} from "../middleware/authValidator.js";
import { validateValidator } from "../middleware/validate.js";
import { authAPIKey } from "../middleware/authentication.js";
import { authLimiter, tokenRefreshLimiter, strictAuthLimiter } from "../middleware/rateLimiter.js";
import { createAccountLockoutMiddleware } from "../utils/accountLockout.js";
import { suspiciousActivityDetector } from "../utils/auditLogger.js";

const router = express.Router();
const accountLockoutCheck = createAccountLockoutMiddleware();

// Apply suspicious activity detector to all auth routes
router.use(suspiciousActivityDetector);

// Public routes with rate limiting and security checks
router.post("/login", 
  authLimiter, 
  accountLockoutCheck,
  loginValidator, 
  validateValidator, 
  login
);

router.post("/register", 
  authLimiter, 
  registerValidator, 
  validateValidator, 
  register
);

router.post("/token", 
  tokenRefreshLimiter, 
  refreshTokenValidator, 
  validateValidator, 
  token
);

// Protected routes (require authentication)
router.delete("/logout", authAPIKey, logout);

export default router;
