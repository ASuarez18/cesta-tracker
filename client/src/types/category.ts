export interface Category {
  category_id: number;
  user_id: string;
  name: string;
  color_hex: string;
}

export interface CreateCategoryPayload {
  name: string;
  color_hex?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  color_hex?: string;
}