import { Router } from "express";
import {
  getStores,
  createStore,
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
 * @route DELETE /api/stores/:id
 * @desc Delete a store by ID
 */
router.delete("/:id", deleteStore);

export default router;