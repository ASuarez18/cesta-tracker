import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { listsApi } from "../../../lib/api/lists";
import { itemsApi } from "../../../lib/api/items";
import type { Item } from "../../../types/item";

interface AddItemToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  onItemAdded: () => void;
}

export const AddItemToListModal: React.FC<AddItemToListModalProps> = ({
  isOpen,
  onClose,
  listId,
  onItemAdded,
}) => {
  // - State for Items
  const [masterItems, setMasterItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // - Form states
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [priceAtPurchase, setPriceAtPurchase] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMasterCatalog();
      resetForm();
    }
  }, [isOpen]);

  /**
   * @function fetchMasterCatalog
   * @desc Fetches the master catalog of items from the API and updates the state
   */
  const fetchMasterCatalog = async () => {
    setIsLoadingItems(true);
    try {
      const data = await itemsApi.getAll();
      setMasterItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch master catalog:", err);
      setMasterItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  /**
   * @function resetForm
   * @desc Resets the form fields to their default values
   */
  const resetForm = () => {
    setSelectedItemId("");
    setQuantity(1);
    setPriceAtPurchase("");
    setError(null);
  };

  /**
   * @function handleItemChange
   * @desc Updates the selected item and its default price when the user selects an item from the dropdown
   * @param {string} itemIdStr - The ID of the selected item as a string
   */
  const handleItemChange = (itemIdStr: string) => {
    setSelectedItemId(itemIdStr);
    if (!itemIdStr) {
      setPriceAtPurchase("");
      return;
    }

    const found = masterItems.find((i) => String(i.item_id) === itemIdStr);
    if (found && found.default_price !== undefined) {
      setPriceAtPurchase(String(found.default_price));
    }
  };

  /**
   * @function handleSubmit
   * @desc Handles the form submission for adding an item to the shopping list
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItemId || !listId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await listsApi.addItem(listId, {
        item_id: Number(selectedItemId),
        quantity: Math.max(1, Number(quantity)),
        price_at_purchase: priceAtPurchase !== "" ? Number(priceAtPurchase) : 0,
      });

      onItemAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add product to list.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Item to List"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {/* > Item Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Select Product <span className="text-red-600">*</span>
          </label>
          <select
            required
            value={selectedItemId}
            onChange={(e) => handleItemChange(e.target.value)}
            disabled={isLoadingItems}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 text-carbon-black-900 disabled:opacity-50"
          >
            <option value="">
              {isLoadingItems ? "Loading catalog..." : "-- Choose from Master Catalog --"}
            </option>
            {masterItems.map((item) => (
              <option key={item.item_id} value={item.item_id}>
                {item.name} {item.default_price ? `($${item.default_price})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* > Quantity & Unit Price Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* > Quantity */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
              Quantity <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500"
            />
          </div>

          {/* > Price */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
              Unit Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceAtPurchase}
              onChange={(e) => setPriceAtPurchase(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
            />
          </div>
        </div>

        {/* > Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-carbon-black-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-carbon-black-700 hover:bg-carbon-black-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedItemId}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? "Adding..." : "Add to List"}
          </button>
        </div>
      </form>
    </Modal>
  );
};