import { pool } from "../db/pool.ts";

export interface Item {
  item_id: number;
  user_id: string;
  category_id: number | null;
  default_store_id: number | null;
  name: string;
  default_price: number;
  created_at: Date;
  category_name?: string;
  category_color?: string;
  default_store_name?: string;
}

export interface GetItemsFilters {
  search?: string;
  categoryId?: number;
}

/**
 * @function getItemsByUserId
 * @desc Retrieves all items for a specific user by their user ID, with optional filters
 * @param {string} userId - The ID of the user whose items are to be retrieved
 * @param {GetItemsFilters} filters - Optional filters for searching and category filtering
 * @returns {Promise<Item[]>} - A promise that resolves to an array of items
 */
export const getItemsByUserId = async (
  userId: string,
  filters: GetItemsFilters = {},
): Promise<Item[]> => {
  const values: any[] = [userId];
  let query = `
    SELECT 
      i.item_id, 
      i.user_id, 
      i.category_id, 
      i.default_store_id, 
      i.name, 
      i.default_price::float AS default_price, 
      i.created_at,
      c.name AS category_name,
      c.color_hex AS category_color,
      s.name AS default_store_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.category_id
    LEFT JOIN stores s ON i.default_store_id = s.store_id
    WHERE i.user_id = $1
  `;

  if (filters.search && filters.search.trim() !== "") {
    values.push(`%${filters.search.trim()}%`);
    query += ` AND i.name ILIKE $${values.length}`;
  }

  if (filters.categoryId) {
    values.push(filters.categoryId);
    query += ` AND i.category_id = $${values.length}`;
  }

  query += ` ORDER BY i.name ASC`;

  const { rows } = await pool.query(query, values);
  return rows;
};

/**
 * @function getItemByIdAndUserId
 * @desc Retrieves a specific item by its ID for a specific user
 * @param {number} itemId - The ID of the item to be retrieved
 * @param {string} userId - The ID of the user who owns the item
 * @returns {Promise<Item | null>} - A promise that resolves to the item if found, or null if not found
 */
export const getItemByIdAndUserId = async (
  itemId: number,
  userId: string,
): Promise<Item | null> => {
  const query = `
    SELECT 
      i.item_id, 
      i.user_id, 
      i.category_id, 
      i.default_store_id, 
      i.name, 
      i.default_price::float AS default_price, 
      i.created_at,
      c.name AS category_name,
      c.color_hex AS category_color,
      s.name AS default_store_name
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.category_id
    LEFT JOIN stores s ON i.default_store_id = s.store_id
    WHERE i.item_id = $1 AND i.user_id = $2
  `;
  const { rows } = await pool.query(query, [itemId, userId]);
  return rows[0] || null;
};

/**
 * @function createItem
 * @desc Creates a new item for a specific user
 * @param {string} userId - The ID of the user for whom the item is to be created
 * @param {Object} data - The data for the new item, including name, category_id, default_store_id, and default_price
 * @returns {Promise<Item>} - A promise that resolves to the newly created item
 */
export const createItem = async (
  userId: string,
  data: {
    name: string;
    category_id: number | null;
    default_store_id: number | null;
    default_price: number;
  },
): Promise<Item> => {
  const query = `
    INSERT INTO items (user_id, category_id, default_store_id, name, default_price)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING item_id, user_id, category_id, default_store_id, name, default_price::float, created_at
  `;
  const { rows } = await pool.query(query, [
    userId,
    data.category_id,
    data.default_store_id,
    data.name,
    data.default_price,
  ]);
  return rows[0];
};

/**
 * @function updateItem
 * @desc Updates an existing item for a specific user
 * @param {number} itemId - The ID of the item to be updated
 * @param {string} userId - The ID of the user who owns the item
 * @param {Object} data - The updated data for the item, including name, category_id, default_store_id, and default_price
 * @returns {Promise<Item | null>} - A promise that resolves to the updated item if successful, or null if the item was not found or not updated
 */
export const updateItem = async (
  itemId: number,
  userId: string,
  data: {
    name: string;
    category_id: number | null;
    default_store_id: number | null;
    default_price: number;
  },
): Promise<Item | null> => {
  const query = `
    UPDATE items
    SET name = $1, category_id = $2, default_store_id = $3, default_price = $4
    WHERE item_id = $5 AND user_id = $6
    RETURNING item_id, user_id, category_id, default_store_id, name, default_price::float, created_at
  `;
  const { rows } = await pool.query(query, [
    data.name,
    data.category_id,
    data.default_store_id,
    data.default_price,
    itemId,
    userId,
  ]);
  return rows[0] || null;
};

/**
 * @function deleteItem
 * @desc Deletes an item by its ID for a specific user
 * @param {number} itemId - The ID of the item to be deleted
 * @param {string} userId - The ID of the user who owns the item
 * @returns {Promise<boolean>} - A promise that resolves to true if the item was deleted, or false if the item was not found or not deleted
 */
export const deleteItem = async (
  itemId: number,
  userId: string,
): Promise<boolean> => {
  const query = `
    DELETE FROM items
    WHERE item_id = $1 AND user_id = $2
  `;
  const { rowCount } = await pool.query(query, [itemId, userId]);
  return (rowCount ?? 0) > 0;
};
