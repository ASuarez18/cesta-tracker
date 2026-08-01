import React, { useState, useEffect } from "react";
import { listsApi } from "../../../lib/api/lists";
import type { ShoppingList } from "../../../types/list";
import { CreateListModal } from "./CreateListModal";
import { formatCurrency, formatDate } from "../../../utils/formatters";

export const ListsDashboardView: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeTab, setActiveTab] = useState<"OPEN" | "CLOSED">("OPEN");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /**
   * @function fetchLists
   * @desc Fetches all shopping lists from the API and updates the state
   */
  const fetchLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listsApi.getAll();
      setLists(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load shopping lists.");
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);


  const filteredLists = lists.filter((l) => l.status === activeTab); // OPEN or CLOSED lists

  /**
   * @function handleListCreated
   * @desc  It either navigates to the new list or refreshes the list view.
   * @param {number} newListId - The ID of the newly created list (optional).
   */
  const handleListCreated = (newListId?: number) => {
    if (newListId) {
      window.location.href = `/app/lists/${newListId}`;
    } else {
      fetchLists();
    }
  };

  return (
    <div className="space-y-6">
      {/* > Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-carbon-black-100 p-3 rounded-2xl shadow-2xs">
        {/* > Tabs */}
        <div className="flex items-center gap-1 bg-carbon-black-50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("OPEN")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "OPEN"
                ? "bg-white text-carbon-black-900 shadow-2xs"
                : "text-carbon-black-600 cursor-pointer hover:text-carbon-black-900"
            }`}
          >
            🛒 Active Runs ({lists.filter((l) => l.status === "OPEN").length})
          </button>
          <button
            onClick={() => setActiveTab("CLOSED")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "CLOSED"
                ? "bg-white text-carbon-black-900 shadow-2xs"
                : "text-carbon-black-600 cursor-pointer hover:text-carbon-black-900"
            }`}
          >
            📜 History ({lists.filter((l) => l.status === "CLOSED").length})
          </button>
        </div>

        {/* > New List Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
        >
          + New Shopping List
        </button>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* > Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-carbon-black-500">
          Loading lists...
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="py-12 text-center text-carbon-black-500 bg-white border border-dashed border-carbon-black-200 rounded-2xl p-6">
          <span className="text-3xl block mb-2">📋</span>
          <p className="text-sm font-medium">
            {activeTab === "OPEN"
              ? "No active shopping lists. Start a new list before heading to the store!"
              : "No closed shopping lists in your history yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => {

            const totalEstimated = list.total_estimated ?? 0;
            const totalSpent = list.total_completed ?? 0;
            const budget = list.budget ?? 0;
            const hasBudget = list.budget !== null && list.budget > 0;
            const isOver = hasBudget && totalSpent > budget;
            const status = list.status || "OPEN";

            return (
              <a
                key={list.list_id}
                href={`/app/lists/${list.list_id}`}
                className="group block bg-white border border-carbon-black-100 rounded-2xl p-5 shadow-2xs hover:border-carbon-black-300 hover:shadow-xs transition-all active:scale-[0.99] space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold font-display text-carbon-black-900 group-hover:text-dusty-olive-800 transition-colors truncate">
                      {list.title}
                    </h3>
                    <p className="text-xs text-carbon-black-500">
                      Created on {formatDate(list.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 border ${
                      list.status === "OPEN"
                        ? "bg-frozen-water-50 text-frozen-water-900 border-frozen-water-300"
                        : "bg-carbon-black-100 text-carbon-black-700 border-carbon-black-200"
                    }`}
                  >
                    {list.status === "OPEN" ? "Active" : "Closed"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-carbon-black-100 text-xs">
                  <div>
                    <span className="block text-carbon-black-500 font-medium mb-0.5">
                      Spent
                    </span>
                    <span
                      className={`text-sm font-bold font-display ${
                        isOver ? "text-red-600" : "text-carbon-black-900"
                      }`}
                    >
                      {status === "OPEN" ? formatCurrency(totalEstimated) : formatCurrency(totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-carbon-black-500 font-medium mb-0.5">
                      Budget
                    </span>
                    <span className="text-sm font-bold font-display text-carbon-black-800">
                      {hasBudget ? formatCurrency(budget) : "No limit"}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
      />
    </div>
  );
};