import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { itemsApi } from "../../../lib/api/items";
import { categoriesApi } from "../../../lib/api/categories";
import { storesApi } from "../../../lib/api/stores";
import type { Item, CreateItemPayload } from "../../../types/item";
import type { Category } from "../../../types/category";
import type { Store } from "../../../types/store";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Item | null;
  onItemSaved: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onItemSaved,
}) => {
  // - Fetch states
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  // - Form State
  const [name, setName] = useState("");
  const [defaultPrice, setDefaultPrice] = useState<string | number>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (editingItem) {
        setName(editingItem.name);
        setDefaultPrice(editingItem.default_price ?? "");
        setCategoryId(editingItem.category_id ? String(editingItem.category_id) : "");
        setStoreId(editingItem.default_store_id ? String(editingItem.default_store_id) : "");
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingItem]);

  /**
   * @function fetchOptions
   * @desc Fetches categories and stores for the select dropdowns
   */
  const fetchOptions = async () => {
    try {
      const [catData, storeData] = await Promise.all([
        categoriesApi.getAll(),
        storesApi.getAll(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setStores(Array.isArray(storeData) ? storeData : []);
    } catch (err: any) {
      console.error("Failed to load options:", err);
      setCategories([]);
      setStores([]);
    }
  };

  /** 
   * @function resetForm
   * @desc Resets the form fields to their initial state
   */
  const resetForm = () => {
    setName("");
    setDefaultPrice("");
    setCategoryId("");
    setStoreId("");
    setError(null);
  };

  /**
   * @function handleSubmit
   * @desc Handles form submission for creating or updating an item
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const payload: CreateItemPayload = {
      name: name.trim(),
      default_price: defaultPrice !== "" ? Number(defaultPrice) : 0,
      category_id: categoryId ? Number(categoryId) : null,
      default_store_id: storeId ? Number(storeId) : null,
    };

    try {
      if (editingItem) {
        await itemsApi.update(editingItem.item_id, payload);
      } else {
        await itemsApi.create(payload);
      }

      onItemSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Product" : "Add New Product"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {/* > Item Name */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Product Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Whole Milk 2L"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
          />
        </div>

        {/* > Price */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={defaultPrice}
            onChange={(e) => setDefaultPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
          />
        </div>

        {/* > Category Select */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 text-carbon-black-900"
          >
            <option value="" className="text-carbon-black-700 font-medium bg-white py-1">-- Select Category (Optional) --</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id} className="text-carbon-black-700 font-medium bg-white py-1">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* > Store Select */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Preferred Store
          </label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 text-carbon-black-900"
          >
            <option value="" className="text-carbon-black-700 font-medium bg-white py-1">-- Select Store (Optional) --</option>
            {stores.map((store) => (
              <option key={store.store_id} value={store.store_id} className="text-carbon-black-700 font-medium bg-white py-1">
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* > Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-carbon-black-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-carbon-black-700 cursor-pointer hover:bg-carbon-black-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting
              ? "Saving..."
              : editingItem
              ? "Update Product"
              : "Save Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};