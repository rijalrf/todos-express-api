import { checkSchema } from "express-validator";

export const loginValidator = checkSchema({
  email: {
    in: "body",
    trim: true,
    isEmail: {
      errorMessage: "email not valid format",
    },
    notEmpty: {
      errorMessage: "email is required",
    },
  },
  password: {
    in: "body",
    notEmpty: {
      errorMessage: "password is required",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "password mush be have minimal 6 character",
    },
  },
});

export const registerValidator = checkSchema({
  name: {
    in: "body",
    trim: true,
    notEmpty: {
      errorMessage: "name is required",
    },
  },
  email: {
    in: "body",
    notEmpty: {
      errorMessage: "email is required",
    },
    isEmail: {
      errorMessage: "invalid format email",
    },
    normalizeEmail: true,
  },
  password: {
    in: "body",
    notEmpty: {
      errorMessage: "password is required",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "password must be have minimal 6 character",
    },
  },
});

export const accessTokenValidator = checkSchema({
  Authorization: {
    in: "headers",
    isIn: ["Bearer "],
    notEmpty: {
      errorMessage: "Unauthorization",
    },
  },
});
export const refreshTokenValidator = checkSchema({
  grant_type: {
    in: "body",
    notEmpty: {
      errorMessage: "grant_type is required",
    },
    equals: {
      options: "refresh_token",
      errorMessage: "grant_type must be 'refresh_token'",
    },
  },
  refresh_token: {
    in: "body",
    notEmpty: {
      errorMessage: "refresh_token is required",
    },
  },
});

// Alternative validator for cookie-based refresh token (future improvement)
export const refreshTokenCookieValidator = checkSchema({
  grant_type: {
    in: "body",
    notEmpty: {
      errorMessage: "grant_type is required",
    },
    equals: {
      options: "refresh_token",
      errorMessage: "grant_type must be 'refresh_token'",
    },
  },
  rt: {
    in: "cookies",
    notEmpty: {
      errorMessage: "refresh token cookie is missing",
    },
  },
});
