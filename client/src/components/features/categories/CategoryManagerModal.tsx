import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { categoriesApi } from "../../../lib/api/categories";
import type { Category } from "../../../types/category";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated,
}) => {
  // - Fetch states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // - Form States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#58a778");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @function fetchCategories
   * @desc Gets the categories from api call and saves them in categories state
   */
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetForm();
    }
  }, [isOpen]);

  /**
   * @function resetForm
   * @desc resets form fields and editing state when modal is closed or after submission
   */
  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setColorHex("#58a778");
    setError(null);
  };

  /**
   * @function handleEditClick
   * @desc Sets the form fields to the selected category's values for editing
   * @param {Category} category - The category to edit
   */
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColorHex(category.color_hex || "#58a778");
  };

  /**
   * @function handleSubmit
   * @desc Handles form submission for creating or updating a category
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.category_id, {
          name: name.trim(),
          color_hex: colorHex,
        });
      } else {
        await categoriesApi.create({
          name: name.trim(),
          color_hex: colorHex,
        });
      }

      resetForm();
      await fetchCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @function handleDelete
   * @desc Deletes a category after user confirmation
   * @param {number} categoryId - The ID of the category to delete
   */
  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setError(null);
    try {
      await categoriesApi.delete(categoryId);
      await fetchCategories();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    }
  };

  const hasCategories = Array.isArray(categories) && categories.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Categories"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {/* > Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-carbon-black-50 rounded-xl border border-carbon-black-100 space-y-4"
        >
          <h4 className="text-sm font-bold font-display text-carbon-black-900">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-carbon-black-800 mb-1">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dairy & Cheese"
                className="w-full px-3 py-2 text-sm bg-white border border-carbon-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-celadon-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-carbon-black-800 mb-1">
                Badge Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-9 p-1 bg-white border border-carbon-black-200 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  placeholder="#58a778"
                  className="w-full px-2 py-2 text-xs font-mono bg-white border border-carbon-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-celadon-500 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {editingCategory && (
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
              className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-lg transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : editingCategory
                  ? "Update Category"
                  : "Add Category"}
            </button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div>
          <h4 className="text-sm font-bold font-display text-carbon-black-900 mb-3">
            Existing Categories ({categories.length})
          </h4>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-carbon-black-500">
              Loading categories...
            </div>
          ) : !hasCategories ? (
            <div className="py-6 text-center text-xs text-carbon-black-500 border border-dashed border-carbon-black-200 rounded-xl">
              No categories created yet.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className="flex items-center justify-between p-2.5 bg-white border border-carbon-black-100 rounded-xl hover:border-carbon-black-200 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color_hex || "#898e71" }}
                    />
                    <span className="text-sm font-medium text-carbon-black-900 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-1.5 text-xs font-medium text-dusty-olive-700 hover:bg-dusty-olive-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.category_id)}
                      className="p-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
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
