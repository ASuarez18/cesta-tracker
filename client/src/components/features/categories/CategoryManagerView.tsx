import React, { useState, useEffect } from "react";
import { categoriesApi } from "../../../lib/api/categories";
import { storesApi } from "../../../lib/api/stores";
import type { Category } from "../../../types/category";
import type { Store } from "../../../types/store";
import { CategoryManagerModal } from "./CategoryManagerModal";
import { StoreManagerModal } from "../stores/StoreManagerModal";

export const CategoryManagerView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  /**
   * @function loadData
   * @desc Fetches categories and stores from the API and updates state
   */
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catData, storeData] = await Promise.all([
        categoriesApi.getAll(),
        storesApi.getAll(),
      ]);
      setCategories(catData);
      setStores(storeData);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const hasStores = Array.isArray(stores) && stores.length > 0;

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Grid for Categories and stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Categories  */}
        <section className="bg-white border border-carbon-black-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-black-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏷️</span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-carbon-black-900">
                Categories ({categories.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
            >
              Manage Categories
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-carbon-black-500">
              Loading categories...
            </div>
          ) : !hasCategories ? (
            <div className="py-8 text-center text-sm text-carbon-black-500 border border-dashed border-carbon-black-200 rounded-xl">
              No categories found. Click above to create your first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-100 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className="flex items-center justify-between p-3 bg-carbon-black-50/50 border border-carbon-black-100 rounded-xl hover:border-carbon-black-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color_hex || "#898e71" }}
                    />
                    <span className="text-sm font-medium text-carbon-black-900 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 text-xs font-mono rounded border text-carbon-black-600 uppercase"
                    style={{
                      backgroundColor: `${cat.color_hex || "#898e71"}15`,
                      borderColor: `${cat.color_hex || "#898e71"}40`,
                    }}
                  >
                    {cat.color_hex || "#898e71"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stores Card / Table Section */}
        <section className="bg-white border border-carbon-black-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-carbon-black-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏪</span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-carbon-black-900">
                Stores ({stores.length})
              </h2>
            </div>
            <button
              onClick={() => setIsStoreModalOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
            >
              Manage Stores
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-carbon-black-500">
              Loading stores...
            </div>
          ) : !hasStores ? (
            <div className="py-8 text-center text-sm text-carbon-black-500 border border-dashed border-carbon-black-200 rounded-xl">
              No stores found. Click above to add your favorite supermarkets.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-100 overflow-y-auto pr-1">
              {stores.map((store) => (
                <div
                  key={store.store_id}
                  className="flex items-center gap-3 p-3 bg-carbon-black-50/50 border border-carbon-black-100 rounded-xl hover:border-carbon-black-200 transition-colors"
                >
                  <span className="p-1.5 bg-dusty-olive-100 text-dusty-olive-800 rounded-lg text-xs">
                    🏪
                  </span>
                  <span className="text-sm font-medium text-carbon-black-900 truncate">
                    {store.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Modals */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoriesUpdated={loadData}
      />

      <StoreManagerModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onStoresUpdated={loadData}
      />
    </div>
  );
};