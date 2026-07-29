import { Router } from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @route GET /api/items
 * @desc Get all items, with optional search and category filter
 */
router.get("/", getItems);               // Soporta query params: ?search=...&category_id=...

/**
 * @route GET /api/items/:id
 * @desc Get an item by ID
 */
router.get("/:id", getItemById);

/**
 * @route POST /api/items
 * @desc Create a new item
 */
router.post("/", createItem);

/**
 * @route PUT /api/items/:id
 * @desc Update an item by ID
 * @param {string} id - The ID of the item to update
 */
router.put("/:id", updateItem);

/**
 * @route DELETE /api/items/:id
 * @desc Delete an item by ID
 * @param {string} id - The ID of the item to delete
 */
router.delete("/:id", deleteItem);

export default router;