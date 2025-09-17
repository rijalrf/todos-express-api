import { body, param, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

// Aturan validasi untuk endpoint getTodoById
export const createOrUpdateTodoRules = [
  body("title").notEmpty().withMessage("title is required"),
];

export const updateStatusTodoRules = [
  param("id").notEmpty().isInt().withMessage("ID must be an integer"),
  body("completed")
    .isBoolean()
    .withMessage("completed must be a boolean value"),
];

export const createOrUpdateTodoItemRules = [
  body("title").notEmpty().withMessage("title is required"),
];

// Middleware untuk mengecek hasil validasi
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Jika tidak ada error, lanjutkan ke controller
  }

  const extractedErrors = errors
    .array()
    .map((err) => ({ message: err.msg, field: err.path }));

  // Buat ApiError dengan pesan umum, dan sertakan semua detail errornya.
  return next(
    new ApiError(
      400,
      "Terdapat kesalahan pada input yang diberikan",
      extractedErrors
    )
  );
};
