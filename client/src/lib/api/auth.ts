import { apiClient } from "./client";
import type { User, AuthResponse } from "../../types/user";

/**
 * @object authApi
 * @desc An object containing methods for user authentication and management
 */
export const authApi = {
  /**
   * @function register
   * @desc Registers a new user with the provided name, email, and password
   * @param name - The name of the user to register
   * @param email - The email of the user to register
   * @param password - The password of the user to register
   * @returns {Promise<AuthResponse>} - A promise that resolves to an object containing a message and the registered user
   */
  register: (name: string, email: string, password: string) =>
    apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    }),
  
  /**
   * @function login
   * @desc Logs in a user with the provided email and password
   * @param {string} email - The email of the user to log in
   * @param {string} password - The password of the user to log in
   * @returns {Promise<AuthResponse>} - A promise that resolves to an object containing a message and the logged-in user
   */
  login: (email: string, password: string) =>
    apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * @function logout
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful logout
   */
  logout: () =>
    apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
      credentials: "include",
    }),

  /**
   * @function getMe
   * @desc Retrieves the currently authenticated user's information
   * @returns {Promise<{ user: User }>} - A promise that resolves to an object containing the authenticated user's information
   */
  getMe: () =>
    apiClient<{ user: User }>("/auth/me", {
      method: "GET",
      credentials: "include",
    }),
};