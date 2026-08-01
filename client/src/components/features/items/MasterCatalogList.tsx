import React, { useState, useEffect, useMemo } from "react";
import { itemsApi } from "../../../lib/api/items";
import { categoriesApi } from "../../../lib/api/categories";
import type { Item } from "../../../types/item";
import type { Category } from "../../../types/category";
import { ItemCard } from "./ItemCard";
import { ItemFormModal } from "./ItemFormModal";
import type { ConfirmModalProps } from "../../../types/ui";
import { ConfirmModal } from "../../ui/ConfirmModal";

export const MasterCatalogList: React.FC = () => {
  // - Fetch states
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // - Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // - Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // - Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalProps>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDanger: false,
    onConfirm: async () => {},
  });

  /**
   * @function fetchCatalogData
   * @desc Fetches items and categories from the API and updates state
   */
  const fetchCatalogData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemData, catData] = await Promise.all([
        itemsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setItems(Array.isArray(itemData) ? itemData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load master catalog.");
      setItems([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);


  /**
   * @function filteredItems
   * @desc Filters items based on search query and selected category
   * @returns {Item[]} Filtered list of items
   */
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      const matchesCategory =
        !selectedCategory ||
        (item.category_id && String(item.category_id) === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  /**
   * @function handleCreateNew
   * @desc Opens the modal for creating a new item
   */
  const handleCreateNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  /**
   * @function handleEdit
   * @desc Opens the modal for editing an existing item
   * @param {Item} item - The item to edit
   */
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  /**
   * @function closeConfirmModal
   * @desc Closes the confirmation modal
   */
  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  /**
   * @function handleDelete
   * @desc Deletes an item after user confirmation and refreshes the catalog
   * @param {number} itemId - The ID of the item to delete
   */
  const handleDelete = (targetItem: Item | number) => {
    const itemObj = typeof targetItem === "number" 
      ? items.find((i) => i.item_id === targetItem)
      : targetItem;

    const itemId = typeof targetItem === "number" ? targetItem : targetItem.item_id;
    const itemName = itemObj?.name ? `"${itemObj.name}"` : "this product";

    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message: `Are you sure you want to delete ${itemName} from your master catalog? This action cannot be undone.`,
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          await itemsApi.delete(itemId);
          await fetchCatalogData();
        } catch (err: any) {
          setError(err.message || "Failed to delete item.");
        } finally {
          closeConfirmModal();
        }
      },
    });
  };


  return (
    <div className="space-y-6">
      {/* > Controls Bar */}
      <div className="bg-white border border-carbon-black-100 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-carbon-black-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-carbon-black-50/60 border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-carbon-black-50/60 border border-carbon-black-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-celadon-500 text-carbon-black-800 shrink-0"
          >
            <option value="" className="text-carbon-black-700 font-medium bg-white py-1">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id} className="text-carbon-black-700 font-medium bg-white py-1">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Button */}
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs active:scale-[0.98] shrink-0"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-carbon-black-500">
          Loading catalog items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-carbon-black-500 bg-white border border-dashed border-carbon-black-200 rounded-2xl p-6">
          <span className="text-3xl block mb-2">📦</span>
          <p className="text-sm font-medium">
            {searchQuery || selectedCategory
              ? "No products match your current search or filter."
              : "Your catalog is empty. Click '+ Add Product' to start building your library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {filteredItems.map((item) => (
            <ItemCard
              key={item.item_id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Item Modal Form */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onItemSaved={fetchCatalogData}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};