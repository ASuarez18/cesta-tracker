import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/Crypto.ts";
import * as UserModel from "../models/userModel.js";

/**
 * @function register
 * @desc Registers a new user and hashes their password
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const passwordHash = await hashPassword(password);

    // Create user in DB
    const newUser = await UserModel.createUser(name, email, passwordHash);

    // Login after register
    req.session!.userId = newUser.user_id;
    req.session!.username = newUser.name;

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function login
 * @desc Authenticates a user and sets session data
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    // console.log("Is Secure?", req.secure);
    // console.log("X-Forwarded-Proto:", req.headers["x-forwarded-proto"]);

    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    req.session!.userId = user.user_id;
    req.session!.username = user.name;

    res.status(200).json({
      message: "Logged in successfully.",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function logout
 * @desc Destroys/resets the user cookie session
 */
export const logout = async (req: Request, res: Response) => {
  req.session = null;
  res.status(200).json({ message: "Logged out successfully." });
};

/**
 * @function getProfile
 * @desc Gets the profile of the currently authenticated user
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await UserModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};