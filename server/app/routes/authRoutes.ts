import { Router } from "express";
import { register, login, logout, getProfile } from "../controllers/authController.ts";
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
 * @route POST /api/auth/logout
 * @desc Clear user session cookie
 * @access Public
 */
router.post("/logout", logout);

/**
 * @route GET /api/auth/me
 * @desc Get the authenticated user's profile
 * @access Private
 */
router.get("/me", authMiddleware, getProfile);

export default router;