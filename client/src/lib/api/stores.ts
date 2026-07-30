import { apiClient } from "./client";
import type {
  Store,
  CreateStorePayload,
  UpdateStorePayload,
  StoreResponse,
} from "../../types/store";

/**
 * @object storesApi
 * @desc An object containing methods for managing stores
 */
export const storesApi = {
  /**
   * @function getAll
   * @desc Retrieves all stores from the API
   * @returns {Promise<Store[]>} - A promise that resolves to an array of stores
   */
  getAll: () =>
    apiClient<Store[]>("/stores", {
      method: "GET",
    }),

  /**
   * @function create
   * @desc Creates a new store with the provided payload
   * @param {CreateStorePayload} payload - The payload containing the store data to create
   * @returns {Promise<StoreResponse>} - A promise that resolves to an object containing a message and the created store
   */
  create: (payload: CreateStorePayload) =>
    apiClient<StoreResponse>("/stores", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * @function update
   * @desc Updates an existing store with the provided ID and payload
   * @param {number} id - The ID of the store to update
   * @param {UpdateStorePayload} payload - The payload containing the updated store data
   * @returns {Promise<StoreResponse>} - A promise that resolves to an object containing a message and the updated store
   */
  update: (id: number, payload: UpdateStorePayload) =>
    apiClient<StoreResponse>(`/stores/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  /**
   * @function delete
   * @desc Deletes an existing store with the provided ID
   * @param {number} id - The ID of the store to delete
   * @returns {Promise<{ message: string }>} - A promise that resolves to an object containing a message indicating successful deletion
   */
  delete: (id: number) =>
    apiClient<{ message: string }>(`/stores/${id}`, {
      method: "DELETE",
    }),
};