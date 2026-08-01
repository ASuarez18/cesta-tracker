import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { listsApi } from "../../../lib/api/lists";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (newListId?: number) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onListCreated,
}) => {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setBudget("");
      setError(null);
    }
  }, [isOpen]);

  /**
   * @function handleSubmit
   * @desc Handles the form submission for creating a new shopping list
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await listsApi.create({
        title: title.trim(),
        budget: budget !== "" ? Number(budget) : null,
      });

      onListCreated(response.list?.list_id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create shopping list.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Shopping List"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {/* > List Title */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            List Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Grocery Run, BBQ Party"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
          />
        </div>

        {/* > Budget Limit */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-carbon-black-800 mb-1">
            Budget Limit ($) <span className="text-carbon-black-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., 150.00"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-carbon-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-celadon-500 placeholder:text-carbon-black-400"
          />
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
            disabled={isSubmitting || !title.trim()}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? "Creating..." : "Create List"}
          </button>
        </div>
      </form>
    </Modal>
  );
};