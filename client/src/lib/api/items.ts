import { apiClient } from "./client";
import type {
  Item,
  CreateItemPayload,
  UpdateItemPayload,
  ItemResponse,
} from "../../types/item";

/**
 * @object itemsApi
 * @desc An object containing methods for managing items
 */
export const itemsApi = {
  /**
   * @function getAll
   * @desc Retrieves all items from the API
   * @returns {Promise<Item[]>} - A promise that resolves to an array of items
   */
  getAll: () =>
    apiClient<Item[]>("/items", {
      method: "GET",
    }),

  /**
   * @function getById
   * @desc Retrieves an item by its ID from the API
   * @param {number} id - The ID of the item to retrieve
   * @returns {Promise<Item>} - A promise that resolves to the item with the specified ID
   */
  getById: (id: number) =>
    apiClient<Item>(`/items/${id}`, {
      method: "GET",
    }),

  /**
   * @function create
   * @desc Creates a new item with the provided payload
   * @param {CreateItemPayload} payload - The payload containing the item data to create
   * @returns {Promise<ItemResponse>} - A promise that resolves to an object containing a message and the created item
   */
  create: (payload: CreateItemPayload) =>
    apiClient<ItemResponse>("/items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * @function update
   * @desc Updates an existing item with the provided ID and payload
   * @param {number} id - The ID of the item to update
   * @param {UpdateItemPayload} payload - The payload containing the updated item data
   * @returns {Promise<ItemResponse>} - A promise that resolves to an object containing a message and the updated item
   */
  update: (id: number, payload: UpdateItemPayload) =>
    apiClient<ItemResponse>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

    /**
     * @function delete
     * @desc Deletes an existing item with the provided ID
     * @param {number} id - The ID of the item to delete
     * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful deletion
     */
  delete: (id: number) =>
    apiClient<{ message: string }>(`/items/${id}`, {
      method: "DELETE",
    }),
};