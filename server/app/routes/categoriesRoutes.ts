import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
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
 * @route PUT /api/categories/:id
 * @desc Update a category by ID
 * @param {string} id - The ID of the category to update
 */
router.put("/:id", updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category by ID
 * @param {string} id - The ID of the category to delete
 */
router.delete("/:id", deleteCategory);

export default router;