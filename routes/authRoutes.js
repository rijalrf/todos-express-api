import express from "express";
import {
  login,
  logout,
  newToken,
  register,
} from "../controllers/authControllers.js";
import {
  loginValidator,
  refreshTokenValidator,
  registeralidator,
} from "../middleware/authValidator.js";
import { validateValidator } from "../middleware/validate.js";
import { validate } from "../middleware/TodoValidator.js";

const router = express.Router();

router.post("/login", loginValidator, validateValidator, login);
router.delete("/logout", logout);
router.post("/register", registeralidator, validateValidator, register);
router.post("/token", refreshTokenValidator, validate, newToken);

export default router;
