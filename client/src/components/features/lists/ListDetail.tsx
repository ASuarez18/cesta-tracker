import React, { useState, useEffect, useMemo } from "react";
import { listsApi } from "../../../lib/api/lists";
import type { ShoppingList, ListItem } from "../../../types/list";
import type { ConfirmModalProps } from "../../../types/ui";
import { formatCurrency } from "../../../utils/formatters";
import { AddItemToListModal } from "./AddItemToListModal";
import { ConfirmModal } from "../../ui/ConfirmModal";

interface ListDetailProps {
  listId: number;
}

export const ListDetail: React.FC<ListDetailProps> = ({ listId }) => {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // - Modals states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isClosingList, setIsClosingList] = useState(false);

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
   * @function fetchListDetail
   * @desc Fetches the details of a specific shopping list by its ID
   */
  const fetchListDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await listsApi.getById(listId);
      
      const rawList = response.list || response;
      const rawItems = rawList.items || response.items || [];


      setList(rawList);
      setItems(Array.isArray(rawItems) ? rawItems : []);
    } catch (err: any) {
      setError(err.message || "Failed to load shopping list details.");
      setList(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (listId) {
      fetchListDetail();
    }
  }, [listId]);

  /**
   * @var {totalSpent, totalEstimated, completedCount, }
   * @desc Calculates the total spent and completed item count for the list
   */
  const { totalSpent, totalEstimated, completedCount } = useMemo(() => {
    if (!Array.isArray(items)) {
      return { totalSpent: 0, totalEstimated: 0, completedCount: 0 };
    }

    let spent = 0;
    let estimated = 0;
    let completed = 0;

    items.forEach((item) => {
      const price = Number(item.price_at_purchase) || 0;
      const qty = Number(item.quantity) || 1;
      const itemSubtotal = price * qty;

      estimated += itemSubtotal;

      if (item.is_completed) {
        spent += itemSubtotal;
        completed += 1;
      }
    });

    return {
      totalSpent: spent,
      totalEstimated: estimated,
      completedCount: completed,
    };
  }, [items]);

  const listTitle = (list as any)?.title || (list as any)?.name || `List #${listId}`;
  const budget = list?.budget ?? 0;
  const hasBudget = list?.budget !== null && list?.budget !== undefined && list.budget > 0;
  
  const currentStatus = (list?.status || "OPEN");
  const isOpen = currentStatus === "OPEN";

  const currentTotal = isOpen ? totalEstimated : totalSpent;
  const isOverBudget = hasBudget && currentTotal > budget;

  /**
   * @function handleToggleComplete
   * @desc Toggles the completion state of a list item and updates the server
   * @param {ListItem} listItem - The list item to toggle
   */
  const handleToggleComplete = async (listItem: ListItem) => {
    if (!isOpen) return;

    const updatedState = !listItem.is_completed;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.list_item_id === listItem.list_item_id
          ? { ...item, is_completed: updatedState }
          : item
      )
    );

    try {
      await listsApi.updateItem(listItem.list_item_id, {
        is_completed: updatedState,
      });
    } catch (err: any) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.list_item_id === listItem.list_item_id
            ? { ...item, is_completed: !updatedState }
            : item
        )
      );
      setError("Failed to update item state.");
    }
  };

  /**
   * @function handleQuantityChange
   * @desc Updates the quantity of a list item and syncs with the server
   * @param {ListItem} listItem - The list item to update
   * @param {number} delta - The change in quantity (positive or negative)
   */
  const handleQuantityChange = async (listItem: ListItem, delta: number) => {
    if (!isOpen) return;

    const newQuantity = Math.max(1, (listItem.quantity || 1) + delta);
    if (newQuantity === listItem.quantity) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.list_item_id === listItem.list_item_id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    try {
      await listsApi.updateItem(listItem.list_item_id, {
        quantity: newQuantity,
      });
    } catch (err) {
      fetchListDetail();
    }
  };

  /**
   * @function handleRemoveItem
   * @desc Removes an item from the list and updates the server
   * @param {number} listItemId - The ID of the list item to remove
   */
  const handleRemoveItem = (listItemId: number) => {
    if (!isOpen) return;

    setConfirmModal({
      isOpen: true,
      title: "Remove Item",
      message: "Are you sure you want to remove this item from your shopping list?",
      confirmText: "Remove",
      isDanger: true,
      onConfirm: async () => {
        setItems((prev) => prev.filter((i) => i.list_item_id !== listItemId));
        try {
          await listsApi.removeItem(listItemId);
        } catch {
          fetchListDetail();
        }
      },
    });
  };

  /**
   * @function handleCloseList
   * @desc Closes the shopping list and updates the server
   */
  const handleCloseList = () => {
    if (!isOpen) return;

    setConfirmModal({
      isOpen: true,
      title: "Finish Shopping",
      message: "Close this shopping list? It will be archived and marked as completed.",
      confirmText: "Close List",
      isDanger: false,
      onConfirm: async () => {
        setIsClosingList(true);
        try {
          await listsApi.closeList(listId);
          window.location.href = "/app/lists";
        } catch (err: any) {
          setError(err.message || "Failed to close list.");
        } finally {
          setIsClosingList(false);
        }
      },
    });
  };

  /**
   * @function closeConfirmModal
   * @desc Closes the confirmation modal without taking any action
   */
  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-carbon-black-500">
        Loading list details...
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="p-6 text-center bg-white border border-red-200 rounded-2xl space-y-3">
        <p className="text-sm text-red-600 font-medium">{error || "List not found."}</p>
        <a
          href="/app/lists"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-dusty-olive-700 rounded-xl"
        >
          Back to Lists
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* > Header */}
      <div className="bg-white border border-carbon-black-100 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-carbon-black-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-carbon-black-900">
                {listTitle}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${
                  isOpen
                    ? "bg-frozen-water-50 text-frozen-water-900 border-frozen-water-300"
                    : "bg-carbon-black-100 text-carbon-black-700 border-carbon-black-200"
                }`}
              >
                {isOpen ? "Active" : "Closed"}
              </span>
            </div>
            <p className="text-xs text-carbon-black-500 mt-1">
              {completedCount} of {items.length} items checked
            </p>
          </div>

          {/* > Actions */}
          <div className="flex items-center gap-2">
            {isOpen ? (
              <>
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
                >
                  + Add Item
                </button>
                <button
                  onClick={handleCloseList}
                  disabled={isClosingList}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-carbon-black-800 bg-carbon-black-100 cursor-pointer hover:bg-carbon-black-200 rounded-xl transition-all active:scale-[0.98]"
                >
                  Finish Shopping
                </button>
              </>
            ) : (
              <span className="text-xs text-carbon-black-500 italic bg-carbon-black-50 px-3 py-1.5 rounded-lg border border-carbon-black-100">
                This list is archived and read-only.
              </span>
            )}
          </div>
        </div>

        {/* > Financial Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="block text-xs text-carbon-black-500 font-medium mb-0.5">
              Total {isOpen ? "Estimated": "Spent"}
            </span>
            <span
              className={`text-lg sm:text-xl font-bold font-display ${
                isOverBudget ? "text-red-600" : "text-carbon-black-900"
              }`}
            >
              {formatCurrency(currentTotal)}
              {}
            </span>
          </div>

          <div>
            <span className="block text-xs text-carbon-black-500 font-medium mb-0.5">
              Budget Target
            </span>
            <span className="text-lg sm:text-xl font-bold font-display text-carbon-black-800">
              {hasBudget ? formatCurrency(budget) : "No limit"}
            </span>
          </div>

          {hasBudget && (
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-xs text-carbon-black-500 font-medium mb-0.5">
                Remaining
              </span>
              <span
                className={`text-lg sm:text-xl font-bold font-display ${
                  budget - currentTotal < 0 ? "text-red-600" : "text-celadon-700"
                }`}
              >
                {formatCurrency(budget - currentTotal)}
              </span>
            </div>
          )}
        </div>

        {/* > Progress Bar */}
        {hasBudget && (
          <div className="space-y-1 pt-1">
            <div className="w-full h-2 bg-carbon-black-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverBudget ? "bg-red-500" : "bg-celadon-500"
                }`}
                style={{
                  width: `${Math.min(100, (currentTotal / budget) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* > Checklist Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-display text-carbon-black-900 px-1">
          Items Checklist
        </h3>

        {items.length === 0 ? (
          <div className="py-12 text-center text-carbon-black-500 bg-white border border-dashed border-carbon-black-200 rounded-2xl p-6 space-y-3">
            <span className="text-3xl block">🛒</span>
            <p className="text-sm font-medium">
              This list is empty.
            </p>
            {isOpen && (
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="inline-block px-4 py-2 text-xs font-semibold text-white bg-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-800 rounded-xl"
              >
                + Add Item Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const isDone = item.is_completed;
              const itemTotal = (item.price_at_purchase || 0) * (item.quantity || 1);

              return (
                <div
                  key={item.list_item_id}
                  className={`flex items-center justify-between p-3.5 bg-white border rounded-2xl transition-all ${
                    isDone
                      ? "border-carbon-black-100 bg-carbon-black-50/40 opacity-60"
                      : "border-carbon-black-100 hover:border-carbon-black-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => handleToggleComplete(item)}
                      disabled={!isOpen}
                      className="w-5 h-5 text-celadon-600 rounded-md border-carbon-black-300 focus:ring-celadon-500 cursor-pointer shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold text-carbon-black-900 truncate ${
                          isDone ? "line-through text-carbon-black-400" : ""
                        }`}
                      >
                        {item.item_name || (item as any).name || "Product"}
                      </p>
                      <p className="text-xs text-carbon-black-500">
                        {formatCurrency(item.price_at_purchase)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {isOpen ? (
                      <div className="flex items-center border border-carbon-black-200 rounded-xl bg-carbon-black-50/60 overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="px-2 py-1 text-xs font-bold text-carbon-black-700 cursor-pointer hover:bg-carbon-black-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold text-carbon-black-900 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="px-2 py-1 text-xs font-bold text-carbon-black-700 cursor-pointer hover:bg-carbon-black-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-carbon-black-700 bg-carbon-black-100 px-2.5 py-1 rounded-lg">
                        x{item.quantity}
                      </span>
                    )}

                    <span className="text-sm font-bold font-display text-carbon-black-900 min-w-15 text-right">
                      {formatCurrency(itemTotal)}
                    </span>

                    {isOpen && (
                      <button
                        onClick={() => handleRemoveItem(item.list_item_id)}
                        className="p-1 text-xs text-red-500 hover:text-red-700 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemToListModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        listId={listId}
        onItemAdded={fetchListDetail}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={async () => {
          await confirmModal.onConfirm();
          closeConfirmModal();
        }}
      />
    </div>
  );
};