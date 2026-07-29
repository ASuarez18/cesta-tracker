import { Router } from "express";
import {
  getLists,
  getListById,
  createList,
  addListItem,
  updateListItem,
  deleteListItem,
  closeList,
  deleteList,
} from "../controllers/listsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Operaciones sobre Listas
/**
 * @route GET /api/lists
 * @desc Get all lists, with optional status filter (OPEN or CLOSED)
 */
router.get("/", getLists);                   // Soporta ?status=OPEN o ?status=CLOSED

/**
 * @route GET /api/lists/:id
 * @desc Get list by Id
 * @param {string} id - The ID of the list to retrieve
 */
router.get("/:id", getListById);

/**
 * @route POST /api/lists
 * @desc Create a new list
 */
router.post("/", createList);

/**
 * @route DELETE /api/lists/:id
 * @desc Delete a list by Id
 * @param {string} id - The ID of the list to delete
 */
router.delete("/:id", deleteList);

// Operaciones sobre Ítems dentro de una Lista
/**
 * @route POST /api/lists/:id/items
 * @desc Add an item to a list
 * @param {string} id - The ID of the list to add the item to
 */
router.post("/:id/items", addListItem);

/**
 * @route PATCH /api/lists/items/:listItemId
 * @desc Update a list item (is_completed, quantity, price_at_purchase)
 * @param {string} listItemId - The ID of the list item to update
 */
router.patch("/items/:listItemId", updateListItem);  

/**
 * @route DELETE /api/lists/items/:listItemId
 * @desc Delete a list item
 * @param {string} listItemId - The ID of the list item to delete
 */
router.delete("/items/:listItemId", deleteListItem);

// Transacción crítica: Cerrar Lista y Transferir a Gastos
/**
 * @route POST /api/lists/:id/close
 * @desc Close a list / TODO: Transfer items to expenses and mark list as CLOSED
 * @param {string} id - The ID of the list to close
 */
router.post("/:id/close", closeList);

export default router;