import { pool } from "../db/pool.ts";

export interface Store {
  store_id: number;
  user_id: string;
  name: string;
  created_at: Date;
}

/**
 * @function getStoresByUserId
 * @desc Retrieves all stores for a specific user by their user ID
 * @param {string} userId - The ID of the user whose stores are to be retrieved
 * @returns {Promise<Store[]>} - A promise that resolves to an array of stores
 */
export const getStoresByUserId = async (userId: string): Promise<Store[]> => {
  const query = `
    SELECT store_id, user_id, name, created_at
    FROM stores
    WHERE user_id = $1
    ORDER BY name ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * @function createStore
 * @desc Creates a new store for a specific user
 * @param {string} userId - The ID of the user for whom the store is to be created
 * @param {string} name - The name of the store to be created
 * @returns {Promise<Store>} - A promise that resolves to the newly created store
 */
export const createStore = async (
  userId: string,
  name: string,
): Promise<Store> => {
  const query = `
    INSERT INTO stores (user_id, name)
    VALUES ($1, $2)
    RETURNING store_id, user_id, name, created_at
  `;
  const { rows } = await pool.query(query, [userId, name]);
  return rows[0];
};

/**
 * @function updateStore
 * @desc Updates an existing store's name for a specific user
 * @param {number} storeId - The ID of the store to be updated
 * @param {string} userId - The ID of the user who owns the store
 * @param {string} name - The new name for the store
 * @returns {Promise<Store | null>} - A promise that resolves to the updated store or null if not found
 */
export const updateStore = async (
  storeId: number,
  userId: string,
  name: string
): Promise<Store | null> => {
  const query = `
    UPDATE stores
    SET name = $1
    WHERE store_id = $2 AND user_id = $3
    RETURNING store_id, user_id, name, created_at
  `;
  const { rows } = await pool.query(query, [name, storeId, userId]);
  return rows[0] || null;
};

/**
 * @function deleteStore
 * @desc Deletes a store by its ID for a specific user
 * @param {number} storeId - The ID of the store to be deleted
 * @param {string} userId - The ID of the user who owns the store
 * @returns {Promise<boolean>} - A promise that resolves to true if the store was deleted, false otherwise
 */
export const deleteStore = async (
  storeId: number,
  userId: string,
): Promise<boolean> => {
  const query = `
    DELETE FROM stores
    WHERE store_id = $1 AND user_id = $2
  `;
  const { rowCount } = await pool.query(query, [storeId, userId]);
  return (rowCount ?? 0) > 0;
};
