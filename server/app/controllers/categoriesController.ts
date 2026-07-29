import type { Request, Response } from "express";
import * as CategoryModel from "../models/categoryModel.js";

/**
 * @function getCategories
 * @desc Retrieves all categories for the logged-in user
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const categories = await CategoryModel.getCategoriesByUserId(String(userId));
    if (!categories) {
      return res.status(404).json({ error: "No categories found for the user." });
    }
    if (categories.length === 0) {
      return res.status(200).json({ message: "No categories available." });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function createCategory
 * @desc Creates a new category for the logged-in user
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const { name, color_hex } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Category name is required." });
    }

    if (!color_hex || !/^#[0-9A-Fa-f]{6}$/.test(color_hex)) {
      return res.status(400).json({ error: "Invalid color hex code." });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: "Category name must be 50 characters or less." });
    }

    const newCategory = await CategoryModel.createCategory(String(userId), name.trim(), color_hex);

    if (!newCategory) {
      return res.status(500).json({ error: "Failed to create category." });
    }

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function updateCategory
 * @desc Updates an existing category for the logged-in user
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id as string, 10);
    const userId = req.session?.userId;
    const { name, color_hex } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    if (!name && !color_hex) {
      return res.status(400).json({ error: "At least name or color_hex is required." });
    }

    const existingCategory = await CategoryModel.getCategoryById(categoryId, userId);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found or unauthorized." });
    }

    const updatedName = name ? name.trim() : existingCategory.name;
    const updatedColorHex = color_hex ? color_hex.trim() : existingCategory.color_hex;

    const updated = await CategoryModel.updateCategory(
      categoryId,
      userId,
      updatedName,
      updatedColorHex
    );

    res.status(200).json({
      message: "Category updated successfully.",
      category: updated,
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @function deleteCategory
 * @desc Deletes a category by ID for the logged-in user
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.session!.userId;
    const categoryId = parseInt(String(req.params.id), 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID." });
    }

    const deleted = await CategoryModel.deleteCategory(categoryId, String(userId));
    if (!deleted) {
      return res.status(404).json({ error: "Category not found or unauthorized." });
    }

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};