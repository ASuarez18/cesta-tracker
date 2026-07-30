export interface ApiResponse<T = void> {
  message?: string;
  error?: string;
  data?: T;
}

export interface ApiErrorResponse {
  error: string;
}