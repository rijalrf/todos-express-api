import { body, param, validationResult } from "express-validator";

// Aturan validasi untuk endpoint getTodoById
const getTodoValidationRules = [
  body("title").notEmpty().withMessage("titile is required"),
];

// Middleware untuk mengecek hasil validasi
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Jika tidak ada error, lanjutkan ke controller
  }

  // Jika ada error, kirim respons 422 Unprocessable Entity
  return res.status(422).json({
    success: false,
    errors: errors.array().map((err) => ({
      message: err.msg,
    })),
  });
};

// Ekspor middleware validasi
export { getTodoValidationRules, validate };
