import { pool } from "../db/pool.ts";

export interface Category {
  category_id: number;
  user_id: string;
  name: string;
  color_hex: string;
}

/**
 * @function getCategoriesByUserId
 * @desc Retrieves all categories for a specific user by their user ID
 * @param {string} userId - The ID of the user whose categories are to be retrieved
 * @returns {Promise<Category[]>} - A promise that resolves to an array of categories
 */
export const getCategoriesByUserId = async (userId: string): Promise<Category[]> => {
  const query = `
    SELECT category_id, user_id, name, color_hex
    FROM categories
    WHERE user_id = $1
    ORDER BY name ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * @function getCategoryById
 * @desc Retrieves a specific category by its ID for a specific user
 * @param {number} categoryId - The ID of the category to retrieve
 * @param {string} userId - The ID of the user who owns the category
 * @returns {Promise<Category | null>} - A promise that resolves to the category or null if not found
 */
export const getCategoryById = async (
  categoryId: number,
  userId: string
): Promise<Category | null> => {
  const query = `
    SELECT category_id, user_id, name, color_hex
    FROM categories
    WHERE category_id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [categoryId, userId]);
  return rows[0] || null;
};

/**
 * @function createCategory
 * @desc Creates a new category for a specific user
 * @param {string} userId - The ID of the user for whom the category is to be created
 * @param {string} name - The name of the category to be created
 * @param {string} [colorHex] - Optional hex color code for the category. Defaults to '#64748b' if not provided
 * @returns {Promise<Category>} - A promise that resolves to the newly created category
 */
export const createCategory = async (
  userId: string,
  name: string,
  colorHex?: string
): Promise<Category> => {
  const query = `
    INSERT INTO categories (user_id, name, color_hex)
    VALUES ($1, $2, COALESCE($3, '#64748b'))
    RETURNING category_id, user_id, name, color_hex
  `;
  const { rows } = await pool.query(query, [userId, name, colorHex || null]);
  return rows[0];
};

/**
 * @function updateCategory
 * @desc Updates an existing category's name and color for a specific user
 * @param {number} categoryId - The ID of the category to be updated
 * @param {string} userId - The ID of the user who owns the category
 * @param {string} name - The new name for the category
 * @param {string} colorHex - The new hex color code for the category
 * @returns {Promise<Category | null>} - A promise that resolves to the updated category or null if not found
 */
export const updateCategory = async (
  categoryId: number,
  userId: string,
  name: string,
  colorHex: string
): Promise<Category | null> => {
  const query = `
    UPDATE categories
    SET name = $1, color_hex = $2
    WHERE category_id = $3 AND user_id = $4
    RETURNING category_id, user_id, name, color_hex
  `;
  const { rows } = await pool.query(query, [name, colorHex, categoryId, userId]);
  return rows[0] || null;
};

/**
 * @function deleteCategory
 * @desc Deletes a category by its ID for a specific user
 * @param {number} categoryId - The ID of the category to be deleted
 * @param {string} userId - The ID of the user who owns the category
 * @returns 
 */
export const deleteCategory = async (categoryId: number, userId: string): Promise<boolean> => {
  const query = `
    DELETE FROM categories
    WHERE category_id = $1 AND user_id = $2
  `;
  const { rowCount } = await pool.query(query, [categoryId, userId]);
  return (rowCount ?? 0) > 0;
};