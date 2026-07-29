import type { Request, Response } from "express";
import * as ListModel from "../models/listModel.js";

/**
 * @function getLists
 * @desc Retrieves all shopping lists for the logged-in user, with optional filters for status and search
 */
export const getLists = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const status = req.query.status as "OPEN" | "CLOSED" | undefined;
    const search = req.query.search as string | undefined;

    if (status && !["OPEN", "CLOSED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status filter. Must be 'OPEN' or 'CLOSED'." });
    }

    if (search && search.trim() === "") {
      return res.status(400).json({ error: "Search filter cannot be empty." });
    }

    if (search && search.length > 100) {
      return res.status(400).json({ error: "Search filter must be 100 characters or less." });
    }

    const lists = await ListModel.getListsByUserId(userId, { status, search });

    if (!lists) {
      return res.status(404).json({ error: "No shopping lists found for the user." });
    }

    res.status(200).json(lists);
  } catch (error) {
    console.error("Error in getLists:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function getListById
 * @desc Retrieves a specific shopping list by its ID for the logged-in user
 */
export const getListById = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listId = parseInt(String(req.params.id), 10);

    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID." });
    }

    const list = await ListModel.getListWithItems(listId, userId);

    if (!list) {
      return res.status(404).json({ error: "Shopping list not found." });
    }

    res.status(200).json(list);
  } catch (error) {
    console.error("Error in getListById:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function createList
 * @desc Creates a new shopping list for the logged-in user
 */
export const createList = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const { title, budget } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "List title is required." });
    }

    if (title.length > 100) {
      return res.status(400).json({ error: "List title must be 100 characters or less." });
    }

    if (budget !== undefined && (isNaN(budget) || budget < 0)) {
      return res.status(400).json({ error: "Budget must be a non-negative number." });
    }

    if (budget !== undefined && budget > 1000000) {
      return res.status(400).json({ error: "Budget must not exceed 1,000,000." });
    }

    if (budget !== undefined && !/^\d+(\.\d{1,2})?$/.test(String(budget))) {
      return res.status(400).json({ error: "Budget must have at most two decimal places." });
    }

    const newList = await ListModel.createList(userId, title.trim(), budget ?? null);

    if (!newList) {
      return res.status(500).json({ error: "Failed to create shopping list." });
    }

    res.status(201).json(newList);
  } catch (error) {
    console.error("Error in createList:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function deleteList
 * @desc Deletes a shopping list by its ID for the logged-in user
 */
export const deleteList = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listId = parseInt(String(req.params.id), 10);

    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID." });
    }

    const deleted = await ListModel.deleteList(listId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "List not found or unauthorized." });
    }

    res.status(200).json({ message: "List deleted successfully." });
  } catch (error) {
    console.error("Error in deleteList:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// > --- Item Management Within Lists ---

/**
 * @function addListItem
 * @desc Adds an item to a specific shopping list for the logged-in user
 */
export const addListItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listId = parseInt(String(req.params.id), 10);
    const { item_id, quantity, price_at_purchase } = req.body;

    if (isNaN(listId) || !item_id) {
      return res.status(400).json({ error: "Valid list_id and item_id are required." });
    }

    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
      return res.status(400).json({ error: "Quantity must be a positive number." });
    }

    if (price_at_purchase !== undefined && (isNaN(price_at_purchase) || price_at_purchase < 0)) {
      return res.status(400).json({ error: "Price at purchase must be a non-negative number." });
    }

    const listItem = await ListModel.addListItemToList(listId, userId, {
      item_id,
      quantity: quantity ?? 1,
      price_at_purchase: price_at_purchase ?? 0.0,
    });

    if (!listItem) {
      return res.status(500).json({ error: "Failed to add item to list." });
    }

    res.status(201).json(listItem);
  } catch (error) {
    console.error("Error in addListItem:", error);
    res.status(500).json({ error: "Internal server error or item already in list." });
  }
};

/**
 * @function updateListItem
 * @desc Updates an item in a specific shopping list for the logged-in user
 */
export const updateListItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listItemId = parseInt(String(req.params.listItemId), 10);
    const { is_completed, quantity, price_at_purchase } = req.body;

    if (isNaN(listItemId)) {
      return res.status(400).json({ error: "Invalid list_item_id." });
    }

    if (is_completed === undefined && quantity === undefined && price_at_purchase === undefined) {
      return res.status(400).json({ error: "At least one field (is_completed, quantity, price_at_purchase) must be provided for update." });
    }

    if (quantity !== undefined && (isNaN(quantity) || quantity <= 0)) {
      return res.status(400).json({ error: "Quantity must be a positive number." });
    }

    if (price_at_purchase !== undefined && (isNaN(price_at_purchase) || price_at_purchase < 0)) {
      return res.status(400).json({ error: "Price at purchase must be a non-negative number." });
    }

    if (is_completed !== undefined && typeof is_completed !== "boolean") {
      return res.status(400).json({ error: "is_completed must be a boolean." });
    }

    const updated = await ListModel.updateListItem(listItemId, userId, {
      is_completed,
      quantity,
      price_at_purchase,
    });

    if (!updated) {
      return res.status(404).json({ error: "List item not found or unauthorized." });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateListItem:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function deleteListItem
 * @desc Deletes an item from a specific shopping list for the logged-in user
 */
export const deleteListItem = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listItemId = parseInt(String(req.params.listItemId), 10);

    if (isNaN(listItemId)) {
      return res.status(400).json({ error: "Invalid list_item_id." });
    }

    const deleted = await ListModel.removeListItem(listItemId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "List item not found or unauthorized." });
    }

    res.status(200).json({ message: "Item removed from list." });
  } catch (error) {
    console.error("Error in deleteListItem:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function closeList
 * @desc Closes a specific shopping list for the logged-in user, marking it as completed
 */
export const closeList = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const listId = parseInt(String(req.params.id), 10);

    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID." });
    }

    const closedList = await ListModel.closeListStatus(listId, userId);
    if (!closedList) {
      return res.status(404).json({ error: "Shopping list not found or already closed." });
    }

    res.status(200).json({ message: "Shopping list closed successfully.", list: closedList });
  } catch (error) {
    console.error("Error in closeList:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};