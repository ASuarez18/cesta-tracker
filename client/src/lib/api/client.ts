import { API_BASE_URL } from "../../utils/constants";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * @class ApiError
 * @desc Custom error class for API errors, extending the built-in Error class
 * @property {number} status - The HTTP status code of the error
 * @property {any} data - Additional data associated with the error
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * @function apiClient
 * @desc A generic function to make API requests using the Fetch API
 *       It handles query parameters, request headers, and error handling
 * @param {string} endpoint - The API endpoint to call (e.g., "/items")
 * @param {RequestOptions} options - Optional configuration for the request, including method, headers, body, and query parameters
 * @returns {Promise<T>} - A promise that resolves to the response data of type T
 */
export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, headers, body, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  /**
   * @object config
   * @desc Configuration object for the Fetch API request
   * @property {string} method - The HTTP method (default is "GET")
   */
  const config: RequestInit = {
    method: customConfig.method || "GET",
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && data?.error) ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
};