import ApiError from "../utils/ApiError.js";
import { verifAccessToken } from "../utils/jwt.js";

// Authentication middleware - validates access token and sets user context
export const authAPIKey = (req, res, next) => {
  const authHeader = req.header("authorization");
  
  if (!authHeader) {
    return next(new ApiError(401, "Authorization header missing"));
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    const decoded = verifAccessToken(token);
    
    // Set user context on request object for use in controllers
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token", error));
  }
};

// Optional: Alternative name for clarity
export const authenticate = authAPIKey;
