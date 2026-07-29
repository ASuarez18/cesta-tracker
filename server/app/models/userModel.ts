import { pool } from "../db/pool.ts";

export interface User {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

/**
 * @function findUserByEmail
 * @desc Finds a user by their email address
 * @param {string} email - The email address of the user to find 
 * @returns {Promise<User | null>} - The user object if found, otherwise null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = `
    SELECT user_id, name, email, password_hash, created_at 
    FROM users 
    WHERE email = $1
  `;
  const { rows } = await pool.query(query, [email.toLowerCase().trim()]);
  return rows[0] || null;
};

/**
 * @function findUserById
 * @desc Finds a user by their user ID
 * @param {string} userId - The ID of the user to find
 * @returns {Promise<User | null>} - The user object if found, otherwise null
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  const query = `
    SELECT user_id, name, email, created_at 
    FROM users 
    WHERE user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
};

/**
 * @function createUser
 * @desc Creates a new user in the database
 * @param {string} name - The name of the user
 * @param {string} email - The email address of the user
 * @param {string} passwordHash - The hashed password of the user
 * @returns {Promise<User>} - The newly created user object
 */
export const createUser = async (
  name: string,
  email: string,
  passwordHash: string,
): Promise<User> => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING user_id, name, email, created_at
  `;
  const { rows } = await pool.query(query, [
    name,
    email.toLowerCase().trim(),
    passwordHash,
  ]);
  return rows[0];
};
