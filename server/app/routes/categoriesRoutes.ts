import { Router } from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoriesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @route GET /api/categories
 * @desc Get all categories
 */
router.get("/", getCategories);

/**
 * @route POST /api/categories
 * @desc Create a new category
 */
router.post("/", createCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category by ID
 */
router.delete("/:id", deleteCategory);

export default router;