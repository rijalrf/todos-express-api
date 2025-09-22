/**
 * Simple validation utilities
 * These are basic helpers for input validation
 */

export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  if (typeof password !== "string") return false;
  return password.length >= 6;
};

// Enhanced password policy
export const isStrongPassword = (password) => {
  if (typeof password !== "string") return false;
  
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Password strength checker with detailed feedback
export const checkPasswordStrength = (password) => {
  if (typeof password !== "string") {
    return {
      isValid: false,
      score: 0,
      feedback: ["Password must be a string"]
    };
  }
  
  const feedback = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
  } else if (password.length >= 8) {
    score += 1;
    if (password.length >= 12) score += 1;
  }
  
  // Character variety checks
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    feedback.push("Password must contain at least one number");
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    feedback.push("Password must contain at least one special character (!@#$%^&*...)");
  } else {
    score += 1;
  }
  
  // Common password patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/, // repeated characters (aaa, 111, etc.)
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push("Password contains common patterns, please choose a more unique password");
      score = Math.max(0, score - 1);
      break;
    }
  }
  
  const strengthLevels = {
    0: "Very Weak",
    1: "Weak", 
    2: "Fair",
    3: "Good",
    4: "Strong",
    5: "Very Strong",
    6: "Excellent"
  };
  
  return {
    isValid: score >= 4, // Require at least "Strong" password
    score,
    strength: strengthLevels[score] || "Unknown",
    feedback: feedback.length > 0 ? feedback : ["Password meets security requirements"]
  };
};

export const isNonEmptyString = (str) => {
  return typeof str === "string" && str.trim().length > 0;
};

export const validateLoginInput = ({ email, password }) => {
  const errors = [];
  
  if (!isNonEmptyString(email)) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }
  
  if (!isNonEmptyString(password)) {
    errors.push("Password is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegisterInput = ({ name, email, password }) => {
  const errors = [];
  
  if (!isNonEmptyString(name)) {
    errors.push("Name is required");
  }
  
  if (!isNonEmptyString(email)) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }
  
  if (!isNonEmptyString(password)) {
    errors.push("Password is required");
  } else {
    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.isValid) {
      errors.push(...passwordCheck.feedback);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Alternative validation for backward compatibility (less strict)
export const validateRegisterInputBasic = ({ name, email, password }) => {
  const errors = [];
  
  if (!isNonEmptyString(name)) {
    errors.push("Name is required");
  }
  
  if (!isNonEmptyString(email)) {
    errors.push("Email is required");
  } else if (!isValidEmail(email)) {
    errors.push("Invalid email format");
  }
  
  if (!isNonEmptyString(password)) {
    errors.push("Password is required");
  } else if (!isValidPassword(password)) {
    errors.push("Password must be at least 6 characters");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRefreshTokenInput = ({ grant_type, refresh_token }) => {
  const errors = [];
  
  if (grant_type !== "refresh_token") {
    errors.push("Invalid grant_type, must be 'refresh_token'");
  }
  
  if (!isNonEmptyString(refresh_token)) {
    errors.push("Refresh token is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};