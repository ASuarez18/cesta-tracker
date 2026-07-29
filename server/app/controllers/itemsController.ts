import type { Request, Response } from "express";
import * as ItemModel from "../models/itemModel.js";

/**
 * @function getItems
 * @desc Retrieves all items for the logged-in user, with optional search and category filters
 */
export const getItems = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const search = req.query.search as string | undefined;
    const categoryId = req.query.category_id
      ? parseInt(req.query.category_id as string, 10)
      : undefined;

    if (categoryId !== undefined && isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    if (search !== undefined && search.trim() === "") {
      return res.status(400).json({ error: "Search query cannot be empty." });
    }

    const items = await ItemModel.getItemsByUserId(String(userId), {
      search,
      categoryId,
    });

    if (!items) {
      return res.status(404).json({ error: "No items found for the user." });
    }

    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getItems:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function getItemById
 * @desc Retrieves a specific item by its ID for the logged-in user
 */
export const getItemById = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const itemId = parseInt(String(req.params.id), 10);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const item = await ItemModel.getItemByIdAndUserId(itemId, String(userId));
    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error in getItemById:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function createItem
 * @desc Creates a new item for the logged-in user
 */
export const createItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const { name, category_id, default_store_id, default_price } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Item name is required." });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: "Item name must be 100 characters or less." });
    }

    if (default_price !== undefined && (isNaN(default_price) || default_price < 0)) {
      return res.status(400).json({ error: "Default price must be a non-negative number." });
    }

    if (category_id !== undefined && isNaN(category_id)) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    if (default_store_id !== undefined && isNaN(default_store_id)) {
      return res.status(400).json({ error: "Invalid store ID." });
    }

    const newItem = await ItemModel.createItem(String(userId), {
      name: name.trim(),
      category_id: category_id || null,
      default_store_id: default_store_id || null,
      default_price: default_price ?? 0.0,
    });

    if (!newItem) {
      return res.status(500).json({ error: "Failed to create item." });
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error in createItem:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function updateItem
 * @desc Updates an existing item for the logged-in user
 */
export const updateItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const itemId = parseInt(String(req.params.id), 10);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const { name, category_id, default_store_id, default_price } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Item name is required." });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: "Item name must be 100 characters or less." });
    }

    if (default_price !== undefined && (isNaN(default_price) || default_price < 0)) {
      return res.status(400).json({ error: "Default price must be a non-negative number." });
    }

    if (category_id !== undefined && isNaN(category_id)) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    if (default_store_id !== undefined && isNaN(default_store_id)) {
      return res.status(400).json({ error: "Invalid store ID." });
    }

    const updatedItem = await ItemModel.updateItem(itemId, String(userId), {
      name: name.trim(),
      category_id: category_id || null,
      default_store_id: default_store_id || null,
      default_price: default_price ?? 0.0,
    });

    if (!updatedItem) {
      return res.status(404).json({ error: "Error updating item. Item not found or unauthorized." });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Error in updateItem:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function deleteItem
 * @desc Deletes an item by ID for the logged-in user
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const itemId = parseInt(String(req.params.id), 10);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const deleted = await ItemModel.deleteItem(itemId, String(userId));
    if (!deleted) {
      return res.status(404).json({ error: "Error deleting item. Item not found or unauthorized." });
    }

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error in deleteItem:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
