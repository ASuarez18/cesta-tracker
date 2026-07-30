import { apiClient } from "./client";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryResponse
} from "../../types/category";

/**
 * @object categoriesApi
 * @desc An object containing methods for managing categories
 */
export const categoriesApi = {
  /**
   * @function getAll
   * @desc Retrieves all categories from the API
   * @returns {Promise<Category[]>} - A promise that resolves to an array of categories
   */
  getAll: () =>
    apiClient<Category[]>("/categories", {
      method: "GET",
    }),

  /**
   * @function create
   * @desc Creates a new category with the provided payload
   * @param {CreateCategoryPayload} payload - The payload containing the category data to create
   * @returns {Promise<CategoryResponse>} - A promise that resolves to an object containing a message and the created category
   */
  create: (payload: CreateCategoryPayload) =>
    apiClient<CategoryResponse>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * @function update
   * @desc Updates an existing category with the provided ID and payload
   * @param id - The ID of the category to update
   * @param {UpdateCategoryPayload} payload - The payload containing the updated category data
   * @returns {Promise<CategoryResponse>} - A promise that resolves to an object containing a message and the updated category
   */
  update: (id: number, payload: UpdateCategoryPayload) =>
    apiClient<CategoryResponse>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /**
   * @function delete
   * @desc Deletes an existing category with the provided ID
   * @param {number} id - The ID of the category to delete
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful deletion
   */
  delete: (id: number) =>
    apiClient<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
    }),
};