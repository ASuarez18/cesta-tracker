import React, { useState, useEffect } from "react";
import { listsApi } from "../../../lib/api/lists";
import { itemsApi } from "../../../lib/api/items";
import type { ShoppingList } from "../../../types/list";
import type { Item } from "../../../types/item"; 
import { formatCurrency, formatDate } from "../../../utils/formatters";

export const DashboardView: React.FC = () => {
  // - States for fetch API data
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @function loadDashboardData
   * @desc Fetches and stores shopping lists and items for the dashboard view
   */
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [listsData, itemsData] = await Promise.all([
        listsApi.getAll(),
        itemsApi.getAll(),
      ]);
      setLists(Array.isArray(listsData) ? listsData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeLists = lists.filter((l) => l.status === "OPEN");
  const closedLists = lists.filter((l) => l.status === "CLOSED");

  // Sum total spent across closed lists (historical)
  const totalHistoricalSpent = closedLists.reduce(
    (acc, curr) => acc + (curr.total_completed || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-dusty-olive-800 to-carbon-black-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-block px-3 py-1 bg-white/10 text-frozen-water-300 text-xs font-mono font-medium rounded-full">
            Smart Grocery Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Welcome back to Cesta Tracker
          </h1>
          <p className="text-xs sm:text-sm text-carbon-black-200">
            Keep your budget on track, organize grocery items by category, and never forget an essential item again.
          </p>
        </div>

        <a
          href="/app/lists"
          className="px-5 py-3 text-xs sm:text-sm font-semibold text-carbon-black-950 bg-frozen-water-400 hover:bg-frozen-water-300 rounded-xl transition-all shadow-xs active:scale-[0.98] shrink-0"
        >
          + Go to Shopping Lists
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Lists Metric */}
        <div className="bg-white border border-carbon-black-100 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-carbon-black-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Runs
            </span>
            <span className="text-lg">🛒</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-display text-carbon-black-900">
            {isLoading ? "..." : activeLists.length}
          </p>
          <p className="text-xs text-carbon-black-500">Pending lists in progress</p>
        </div>

        {/* Master Catalog Items */}
        <div className="bg-white border border-carbon-black-100 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-carbon-black-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Catalog Products
            </span>
            <span className="text-lg">📦</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-display text-carbon-black-900">
            {isLoading ? "..." : items.length}
          </p>
          <p className="text-xs text-carbon-black-500">Saved items in master catalog</p>
        </div>

        {/* Total Spent in History */}
        <div className="bg-white border border-carbon-black-100 rounded-2xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-carbon-black-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Spent
            </span>
            <span className="text-lg">💳</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-display text-dusty-olive-800">
            {isLoading ? "..." : formatCurrency(totalHistoricalSpent)}
          </p>
          <p className="text-xs text-carbon-black-500">Across {closedLists.length} closed runs</p>
        </div>
      </div>

      {/* Active Run Quick Access */}
      <div className="bg-white border border-carbon-black-100 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-carbon-black-100 pb-4">
          <h2 className="text-lg font-bold font-display text-carbon-black-900">
            Current Active Shopping Run
          </h2>
          <a
            href="/app/lists"
            className="text-xs font-semibold text-dusty-olive-700 hover:underline"
          >
            View All →
          </a>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-carbon-black-500">
            Loading active runs...
          </div>
        ) : activeLists.length === 0 ? (
          <div className="py-8 text-center text-xs text-carbon-black-500 border border-dashed border-carbon-black-200 rounded-xl">
            No active shopping list right now. Create one to get started!
          </div>
        ) : (
          <div className="p-4 bg-carbon-black-50/60 border border-carbon-black-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2 py-0.5 text-xs font-semibold bg-frozen-water-100 text-frozen-water-900 border border-frozen-water-300 rounded-lg">
                Active
              </span>
              <h3 className="text-base font-bold font-display text-carbon-black-900">
                {activeLists[0].title}
              </h3>
              <p className="text-xs text-carbon-black-500">
                Created on {formatDate(activeLists[0].created_at)}
              </p>
            </div>

            <a
              href={`/app/lists/${activeLists[0].list_id}`}
              className="px-4 py-2 text-xs font-semibold text-white bg-dusty-olive-700 hover:bg-dusty-olive-800 rounded-xl transition-all shrink-0"
            >
              Open Checklist →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};