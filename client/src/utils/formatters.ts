/**
 * @function formatCurrency
 * @desc Formats a number or string as a currency string in CADformat.
 * @param {number | string | null | undefined} amount - The amount to format.
 * @returns {string} - The formatted currency string (e.g., "$1,234.56").
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * @function formatDate
 * @desc Formats a date string or Date object into a short date representation (e.g., "Jul 29, 2023").
 * @param {string | Date | null | undefined} dateString - The date to format.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

/**
 * @function formatDateTime
 * @desc Formats a date string or Date object into a short date and time representation (e.g., "Jul 29, 2023, 3:45 PM").
 * @param {string | Date | null | undefined} dateString - The date and time to format.
 * @returns {string} - The formatted date and time string.
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};