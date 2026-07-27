import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return token
 * @access Public
 */
router.post("/login", login);

/**
 * @route GET /api/auth/me
 * @desc Get the authenticated user's profile
 * @access Private
 */
router.get("/me", authMiddleware, getProfile);

export default router;