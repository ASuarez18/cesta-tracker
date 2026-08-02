import React from "react";
import type { Item } from "../../../types/item";
import { formatCurrency } from "../../../utils/formatters";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (itemId: number) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const categoryColor = item.category_color || "#898e71";

  // console.log("ItemCard Rendered:", item);

  /**
   * @function isLightColor
   * @desc Determines if a given hex color is considered "light" based on its luminance
   * @param {string} hexColor - The hex color code to evaluate (e.g., "#FFFFFF" or "#FFF")
   * @returns {boolean} - Returns true if the color is light, false otherwise
   */
  const isLightColor = (hexColor?: string): boolean => {
    if (!hexColor) return false;

    const hex = hexColor.replace("#", "");

    const r = parseInt(
      hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2),
      16,
    );
    const g = parseInt(
      hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4),
      16,
    );
    const b = parseInt(
      hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6),
      16,
    );

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq > 200;
  };

  const isLight = isLightColor(categoryColor);

  const badgeTextColor = isLight ? "#27272a" : categoryColor; 
  const badgeBgColor = isLight ? "#f4f4f5" : `${categoryColor}15`; 
  const badgeBorderColor = isLight ? "#d4d4d8" : `${categoryColor}40`; 

  return (
    <div className="bg-white border border-carbon-black-100 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-carbon-black-200 transition-all flex flex-col justify-between gap-3 group">
      {/* > Name & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold font-display text-carbon-black-900 truncate">
            {item.name}
          </h3>
          <p className="text-base sm:text-lg font-semibold text-dusty-olive-800">
            {formatCurrency(item.default_price)}
          </p>
        </div>

        {/* > Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-xs font-medium text-dusty-olive-700 cursor-pointer hover:bg-dusty-olive-50 rounded-lg transition-colors"
            title="Edit Item"
            aria-label="Edit Item"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item.item_id)}
            className="p-1.5 text-xs font-medium text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Item"
            aria-label="Delete Item"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* > Category & Store */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-carbon-black-100/80 text-xs">
        {/* Category Badge */}
        {item.category_name ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium truncate max-w-37.5"
            style={{
              backgroundColor: badgeBgColor,
              color: badgeTextColor,
              borderColor: badgeBorderColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="truncate">{item.category_name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-carbon-black-200 bg-carbon-black-50 text-carbon-black-500 font-medium text-2xs">
            Uncategorized
          </span>
        )}

        {/* Store Badge */}
        {item.default_store_name ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dusty-olive-200 bg-dusty-olive-50 text-dusty-olive-900 font-medium truncate max-w-37.5">
            <span>🏪</span>
            <span className="truncate">{item.default_store_name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-carbon-black-200 bg-carbon-black-50 text-carbon-black-500 font-medium text-2xs">
            No default store
          </span>
        )}
      </div>
    </div>
  );
};
