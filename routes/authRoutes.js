import express from "express";
import {
  login,
  logout,
  newToken,
  register,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/login", login);
router.delete("/logout", logout);
router.post("/register", register);
router.post("/token", newToken);

export default router;
