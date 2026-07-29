import { pool } from "../db/pool.ts";

export interface ShoppingList {
  list_id: number;
  user_id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  budget: number | null;
  created_at: Date;
  closed_at: Date | null;
  total_estimated?: number;
  total_completed?: number;
  total_items?: number;
}

export interface ListItemDetails {
  list_item_id: number;
  list_id: number;
  item_id: number;
  item_name: string;
  category_name?: string;
  category_color?: string;
  default_store_name?: string;
  quantity: number;
  price_at_purchase: number;
  is_completed: boolean;
}

/**
 * @function getListsByUserId
 * @desc Retrieves all shopping lists for a specific user by their user ID, with optional filters for status and search
 * @param {string} userId - The ID of the user whose shopping lists are to be retrieved
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<ShoppingList[]>} - A promise that resolves to an array of shopping lists
 */
export const getListsByUserId = async (
  userId: string,
  filters: { status?: "OPEN" | "CLOSED"; search?: string } = {},
): Promise<ShoppingList[]> => {
  const values: any[] = [userId];
  let query = `
    SELECT 
      l.list_id,
      l.user_id,
      l.title,
      l.status,
      l.budget::float AS budget,
      l.created_at,
      l.closed_at,
      COUNT(li.list_item_id)::int AS total_items,
      COALESCE(SUM(li.quantity * li.price_at_purchase), 0)::float AS total_estimated,
      COALESCE(SUM(CASE WHEN li.is_completed = TRUE THEN (li.quantity * li.price_at_purchase) ELSE 0 END), 0)::float AS total_completed
    FROM shopping_lists l
    LEFT JOIN list_items li ON l.list_id = li.list_id
    WHERE l.user_id = $1
  `;

  if (filters.status) {
    values.push(filters.status);
    query += ` AND l.status = $${values.length}`;
  }

  if (filters.search && filters.search.trim() !== "") {
    values.push(`%${filters.search.trim()}%`);
    query += ` AND l.title ILIKE $${values.length}`;
  }

  query += `
    GROUP BY l.list_id
    ORDER BY l.created_at DESC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
};

/**
 * @function getListWithItems
 * @desc Retrieves a specific shopping list along with its items for a specific user
 * @param {number} listId - The ID of the shopping list to retrieve
 * @param {string} userId - The ID of the user who owns the shopping list
 * @returns {Promise<{ list: ShoppingList; items: ListItemDetails[] } | null>} - A promise that resolves to the shopping list and its items, or null if not found
 */
export const getListWithItems = async (
  listId: number,
  userId: string,
): Promise<{ list: ShoppingList; items: ListItemDetails[] } | null> => {
  // - Metadata
  const listQuery = `
    SELECT 
      l.list_id,
      l.user_id,
      l.title,
      l.status,
      l.budget::float AS budget,
      l.created_at,
      l.closed_at
    FROM shopping_lists l
    WHERE l.list_id = $1 AND l.user_id = $2
  `;
  const listRes = await pool.query(listQuery, [listId, userId]);
  if (listRes.rows.length === 0) return null;

  // - Items from the list
  const itemsQuery = `
    SELECT 
      li.list_item_id,
      li.list_id,
      li.item_id,
      i.name AS item_name,
      c.name AS category_name,
      c.color_hex AS category_color,
      s.name AS default_store_name,
      li.quantity,
      li.price_at_purchase::float AS price_at_purchase,
      li.is_completed
    FROM list_items li
    INNER JOIN items i ON li.item_id = i.item_id
    LEFT JOIN categories c ON i.category_id = c.category_id
    LEFT JOIN stores s ON i.default_store_id = s.store_id
    WHERE li.list_id = $1
    ORDER BY li.is_completed ASC, i.name ASC
  `;
  const itemsRes = await pool.query(itemsQuery, [listId]);

  return {
    list: listRes.rows[0],
    items: itemsRes.rows,
  };
};

/**
 * @function createList
 * @desc Creates a new shopping list for a specific user
 * @param {string} userId - The ID of the user for whom the shopping list is to be created
 * @param {string} title - The title of the shopping list to be created
 * @param {number | null} budget - Optional budget for the shopping list. Can be null
 * @returns 
 */
export const createList = async (
  userId: string,
  title: string,
  budget: number | null,
): Promise<ShoppingList> => {
  const query = `
    INSERT INTO shopping_lists (user_id, title, budget)
    VALUES ($1, $2, $3)
    RETURNING list_id, user_id, title, status, budget::float, created_at, closed_at
  `;
  const { rows } = await pool.query(query, [userId, title, budget]);
  return rows[0];
};

/**
 * @function deleteList
 * @desc Deletes a shopping list by its ID for a specific user
 * @param {number} listId - The ID of the shopping list to be deleted
 * @param {string} userId - The ID of the user who owns the shopping list
 * @returns {Promise<boolean>} - A promise that resolves to true if the list was deleted, false otherwise
 */
export const deleteList = async (
  listId: number,
  userId: string,
): Promise<boolean> => {
  const query = `
    DELETE FROM shopping_lists
    WHERE list_id = $1 AND user_id = $2
  `;
  const { rowCount } = await pool.query(query, [listId, userId]);
  return (rowCount ?? 0) > 0;
};

// > --- Item Management Within Lists ---

/**
 * @function addListItemToList
 * @desc Adds an item to a specific shopping list for a specific user
 * @param {number} listId - The ID of the shopping list to which the item is to be added
 * @param {string} userId - The ID of the user who owns the shopping list
 * @param {Object} data - The data for the item to be added, including item_id, quantity, and price_at_purchase
 * @returns {Promise<ListItemDetails>} - A promise that resolves to the newly added list item details
 */
export const addListItemToList = async (
  listId: number,
  userId: string,
  data: { item_id: number; quantity: number; price_at_purchase: number },
): Promise<ListItemDetails> => {
  // Veify that list is from user
  const listCheck = await pool.query(
    `SELECT list_id FROM shopping_lists WHERE list_id = $1 AND user_id = $2`,
    [listId, userId],
  );

  if (listCheck.rows.length === 0) {
    throw new Error("Shopping list not found or unauthorized.");
  }

  const query = `
    INSERT INTO list_items (list_id, item_id, quantity, price_at_purchase)
    VALUES ($1, $2, $3, $4)
    RETURNING list_item_id, list_id, item_id, quantity, price_at_purchase::float, is_completed
  `;
  const { rows } = await pool.query(query, [
    listId,
    data.item_id,
    data.quantity,
    data.price_at_purchase,
  ]);

  return rows[0];
};

/**
 * @function updateListItem
 * @desc Updates an item in a specific shopping list for a specific user
 * @param {number} listItemId - The ID of the list item to be updated
 * @param {string} userId - The ID of the user who owns the shopping list
 * @param {Object} updates - The updates to be applied to the list item, including is_completed, quantity, and price_at_purchase
 * @returns 
 */
export const updateListItem = async (
  listItemId: number,
  userId: string,
  updates: {
    is_completed?: boolean;
    quantity?: number;
    price_at_purchase?: number;
  },
): Promise<ListItemDetails | null> => {
  const query = `
    UPDATE list_items li
    SET 
      is_completed = COALESCE($1, li.is_completed),
      quantity = COALESCE($2, li.quantity),
      price_at_purchase = COALESCE($3, li.price_at_purchase)
    FROM shopping_lists sl
    WHERE li.list_id = sl.list_id 
      AND li.list_item_id = $4 
      AND sl.user_id = $5
    RETURNING li.list_item_id, li.list_id, li.item_id, li.quantity, li.price_at_purchase::float, li.is_completed
  `;
  const { rows } = await pool.query(query, [
    updates.is_completed ?? null,
    updates.quantity ?? null,
    updates.price_at_purchase ?? null,
    listItemId,
    userId,
  ]);
  return rows[0] || null;
};

/**
 * @function removeListItem
 * @desc Removes an item from a specific shopping list for a specific user
 * @param {number} listItemId - The ID of the list item to be removed
 * @param {string} userId - The ID of the user who owns the shopping list
 * @returns {Promise<boolean>} - A promise that resolves to true if the item was removed, false otherwise
 */
export const removeListItem = async (
  listItemId: number,
  userId: string,
): Promise<boolean> => {
  const query = `
    DELETE FROM list_items li
    USING shopping_lists sl
    WHERE li.list_id = sl.list_id 
      AND li.list_item_id = $1 
      AND sl.user_id = $2
  `;
  const { rowCount } = await pool.query(query, [listItemId, userId]);
  return (rowCount ?? 0) > 0;
};

/**
 * @function closeListStatus
 * @desc Closes a specific shopping list for a specific user, marking it as completed
 * @param {number} listId - The ID of the shopping list to be closed
 * @param {string} userId - The ID of the user who owns the shopping list
 * @returns {Promise<ShoppingList | null>} - A promise that resolves to the updated shopping list, or null if not found or unauthorized
 */
export const closeListStatus = async (
  listId: number,
  userId: string,
): Promise<ShoppingList | null> => {
  const query = `
    UPDATE shopping_lists
    SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP
    WHERE list_id = $1 AND user_id = $2 AND status = 'OPEN'
    RETURNING list_id, user_id, title, status, budget::float, created_at, closed_at
  `;
  const { rows } = await pool.query(query, [listId, userId]);
  return rows[0] || null;
};
