import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * @function hashPassword
 * @param {string} password - The raw plain-text password to be encrypted
 * @returns {Promise<string>} A promise that resolves to the securely encrypted password hash
 * @description Hashes a plain-text password asynchronously using bcrypt with a predefined computational salt factor of 12 rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @function comparePassword
 * @param {string} inputPassword - The raw plain-text password provided by the user during login
 * @param {string} storedHash - The encrypted password hash retrieved from the user's account data
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches the hash, otherwise false
 * @description Performs a secure, time-safe cryptographic comparison between a plain-text password input and an existing bcrypt hash.
 */
export async function comparePassword(
  inputPassword: string,
  storedHash: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, storedHash);
}