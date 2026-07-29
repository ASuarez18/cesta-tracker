import type { Request, Response } from "express";
import * as StoreModel from "../models/storeModel.js";

/**
 * @function getStores
 * @desc Retrieves all stores for the logged-in user
 */
export const getStores = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const stores = await StoreModel.getStoresByUserId(userId);

    if (!stores) {
      return res.status(404).json({ error: "No stores found for the user." });
    }
    
    res.status(200).json(stores);
  } catch (error) {
    console.error("Error in getStores:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function createStore
 * @desc Creates a new store for the logged-in user
 */
export const createStore = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Store name is required." });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: "Store name must be 50 characters or less." });
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return res.status(400).json({ error: "Store name can only contain letters, numbers, and spaces." });
    }

    const newStore = await StoreModel.createStore(userId, name.trim());

    if (!newStore) {
      return res.status(500).json({ error: "Failed to create store." });
    }

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error in createStore:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function updateStore
 * @desc Updates an existing store's name for the logged-in user
 */
export const updateStore = async (req: Request, res: Response) => {
  try {
    const storeId = parseInt(req.params.id as string, 10);
    const userId = req.session?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID." });
    }

    if (!name) {
      return res.status(400).json({ error: "Store name is required." });
    }

    const updated = await StoreModel.updateStore(storeId, userId, name.trim());

    if (!updated) {
      return res.status(404).json({ error: "Store not found or unauthorized." });
    }

    res.status(200).json({
      message: "Store updated successfully.",
      store: updated,
    });
  } catch (error) {
    console.error("Error in updateStore:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function deleteStore
 * @desc Deletes a store by its ID for the logged-in user
 */
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const storeId = parseInt(String(req.params.id), 10);

    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID." });
    }

    const deleted = await StoreModel.deleteStore(storeId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Store not found or unauthorized." });
    }

    res.status(200).json({ message: "Store deleted successfully." });
  } catch (error) {
    console.error("Error in deleteStore:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};