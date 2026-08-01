import { apiClient } from "./client";
import type {
  ShoppingList,
  ListItem,
  CreateListPayload,
  AddItemToListPayload,
  UpdateListItemPayload,
  ShoppingListResponse,
  ListItemResponse,
} from "../../types/list";

/**
 * @object listsApi
 * @desc An object containing methods for managing shopping lists and their items
 */
export const listsApi = {
  /**
   * @function getAll
   * @desc Retrieves all shopping lists from the API
   * @returns {Promise<ShoppingList[]>} - A promise that resolves to an array of shopping lists
   */
  getAll: () =>
    apiClient<ShoppingList[]>("/lists", {
      method: "GET",
    }),

  /**
   * @function getById
   * @desc Retrieves a shopping list by its ID from the API
   * @param {number} id - The ID of the shopping list to retrieve
   * @returns {Promise<ShoppingList>} - A promise that resolves to the shopping list with the specified ID
   */
  getById: (id: number) =>
    apiClient<ShoppingList>(`/lists/${id}`, {
      method: "GET",
    }),

  /**
   * @function create
   * @desc Creates a new shopping list with the provided payload
   * @param {CreateListPayload} payload - The payload containing the shopping list data to create
   * @returns {Promise<ShoppingListResponse>} - A promise that resolves to an object containing a message and the created shopping list
   */
  create: (payload: CreateListPayload) =>
    apiClient<ShoppingListResponse>("/lists", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * @function delete
   * @desc Deletes an existing shopping list with the provided ID
   * @param {number} id - The ID of the shopping list to delete
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful deletion
   */
  delete: (id: number) =>
    apiClient<{ message: string }>(`/lists/${id}`, {
      method: "DELETE",
    }),

  // > Managing items within a shopping list
  /**
   * @function addItem
   * @desc Adds an item to a shopping list with the provided list ID and payload
   * @param {number} listId - The ID of the shopping list to which the item will be added
   * @param {AddItemToListPayload} payload - The payload containing the item data to add
   * @returns {Promise<ListItemResponse>} - A promise that resolves to an object containing a message and the added item
   */
  addItem: (listId: number, payload: AddItemToListPayload) =>
    apiClient<ListItemResponse>(`/lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * @function updateItem
   * @desc Updates an existing item in a shopping list with the provided list item ID and payload
   * @param {number} listItemId - The ID of the item in the shopping list to update
   * @param {UpdateListItemPayload} payload - The payload containing the updated item data
   * @returns {Promise<ListItemResponse>} - A promise that resolves to an object containing a message and the updated item
   */
  updateItem: (listItemId: number, payload: UpdateListItemPayload) =>
    apiClient<ListItemResponse>(`/lists/items/${listItemId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  /**
   * @function removeItem
   * @desc Removes an existing item from a shopping list with the provided list item ID
   * @param {number} listItemId - The ID of the item in the shopping list to remove
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful removal
   */
  removeItem: (listItemId: number) =>
    apiClient<{ message: string }>(`/lists/items/${listItemId}`, {
      method: "DELETE",
    }),

    /**
     * @function closeList
     * @desc Closes a shopping list with the provided list ID, marking it as completed
     * @param {number} listId - The ID of the shopping list to close
     * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful closure
     */
    closeList: (listId: number) =>
    apiClient<{ message: string }>(`/lists/${listId}/close`, {
      method: "POST",
    }),
};