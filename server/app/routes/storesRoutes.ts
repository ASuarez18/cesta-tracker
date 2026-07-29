import { Router } from "express";
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from "../controllers/storesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @route GET /api/stores
 * @desc Get all stores
 */
router.get("/", getStores);

/**
 * @route POST /api/stores
 * @desc Create a new store
 */
router.post("/", createStore);

/**
 * @route PUT /api/stores/:id
 * @desc Update a store by ID
 * @param {string} id - The ID of the store to update
 */
router.put("/:id", updateStore);

/**
 * @route DELETE /api/stores/:id
 * @desc Delete a store by ID
 * @param {string} id - The ID of the store to delete
 */
router.delete("/:id", deleteStore);

export default router;