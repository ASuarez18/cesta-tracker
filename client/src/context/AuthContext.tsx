import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/user";
import { authApi } from "../lib/api/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @desc Provides authentication context to the application, managing user state and authentication actions
 * @param { children: React.ReactNode } - The child components that will have access to the authentication context
 * @returns {JSX.Element} - The AuthContext.Provider wrapping the children components
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  /**
   * @function login
   * @desc Logs in a user with the provided email and password, updating the user state upon success
   * @param {string} email - The email of the user attempting to log in
   * @param {string} pass - The password of the user attempting to log in
   * @returns {Promise<void>} - A promise that resolves when the login process is complete
   */
  const login = async (email: string, pass: string) => {
    const data = await authApi.login(email, pass);
    setUser(data.user);
  };

  /**
   * @function Register
   * @desc Logs in a user with the provided email and password, updating the user state upon success
   * @param {string} name - The name of the user attempting to register
   * @param {string} email - The email of the user attempting to log in
   * @param {string} pass - The password of the user attempting to log in
   * @returns {Promise<void>} - A promise that resolves when the register process is complete
   */
  const register = async (name: string, email: string, pass: string) => {
    const data = await authApi.register(name, email, pass);
    setUser(data.user);
  };

  /**
   * @function logout
   * @desc Logs out the current user, clearing the user state and redirecting to the login page
   * @returns {Promise<void>} - A promise that resolves when the logout process is complete
   */
  const logout = async () => {
    await authApi.logout();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};