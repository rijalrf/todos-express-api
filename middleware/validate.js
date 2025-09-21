import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validateValidator = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      message: e.msg,
      filed: e.path,
    }));
    return next(new ApiError(403, "input not valid", errors));
  }
  next();
};
