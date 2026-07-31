import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { storesApi } from "../../../lib/api/stores";
import type { Store } from "../../../types/store";

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoresUpdated?: () => void;
}

export const StoreManagerModal: React.FC<StoreManagerModalProps> = ({
  isOpen,
  onClose,
  onStoresUpdated,
}) => {

  // - Fetch states
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // - Form states
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function fetchStores
   * @desc Gets the stores from api call and saves them in stores state
   */
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await storesApi.getAll();
      setStores(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load stores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStores();
      resetForm();
    }
  }, [isOpen]);

  /**
   * @function resetForm
   * @desc resets form fields and editing state when modal is closed or after submission
   */
  const resetForm = () => {
    setEditingStore(null);
    setName("");
    setError(null);
  };

  /**
   * @function handleEditClick
   * @desc Sets the form fields to the selected category's values for editing
   * @param {Category} category - The category to edit
   */
  const handleEditClick = (store: Store) => {
    setEditingStore(store);
    setName(store.name);
  };

  /**
   * @function handleSubmit
   * @desc Handles form submission for creating or updating a store
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingStore) {
        await storesApi.update(editingStore.store_id, {
          name: name.trim(),
        });
      } else {
        await storesApi.create({
          name: name.trim(),
        });
      }

      resetForm();
      await fetchStores();
      if (onStoresUpdated) onStoresUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to save store.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @function handleDelete
   * @desc Deletes a category after user confirmation
   * @param {number} categoryId - The ID of the category to delete
   */
  const handleDelete = async (storeId: number) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    setError(null);
    try {
      await storesApi.delete(storeId);
      await fetchStores();
      if (onStoresUpdated) onStoresUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete store.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Stores"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            {error}
          </div>
        )}

        {/* > Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-carbon-black-50 rounded-xl border border-carbon-black-100 space-y-4"
        >
          <h4 className="text-sm font-bold font-display text-carbon-black-900">
            {editingStore ? "Edit Store" : "Add New Store"}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-carbon-black-800 mb-1">
              Store Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Walmart, Costco, Local Bakery"
              className="w-full px-3 py-2 text-sm bg-white border border-carbon-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-celadon-500 transition-all placeholder:text-carbon-black-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {editingStore && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs font-medium text-carbon-black-700 hover:bg-carbon-black-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-lg transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting
                ? "Saving..."
                : editingStore
                ? "Update Store"
                : "Add Store"}
            </button>
          </div>
        </form>

        {/* Existing Stores List */}
        <div>
          <h4 className="text-sm font-bold font-display text-carbon-black-900 mb-3">
            Existing Stores ({stores.length})
          </h4>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-carbon-black-500">
              Loading stores...
            </div>
          ) : stores.length === 0 ? (
            <div className="py-6 text-center text-xs text-carbon-black-500 border border-dashed border-carbon-black-200 rounded-xl">
              No stores created yet.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {stores.map((store) => (
                <div
                  key={store.store_id}
                  className="flex items-center justify-between p-2.5 bg-white border border-carbon-black-100 rounded-xl hover:border-carbon-black-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 bg-dusty-olive-100 text-dusty-olive-800 rounded-lg text-xs">
                      🏪
                    </span>
                    <span className="text-sm font-medium text-carbon-black-900 truncate">
                      {store.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(store)}
                      className="p-1.5 text-xs font-medium text-dusty-olive-700 hover:bg-dusty-olive-50 rounded-lg transition-colors"
                      title="Edit Store"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(store.store_id)}
                      className="p-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Store"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};