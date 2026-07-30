export interface Item {
  item_id: number;
  user_id: string;
  category_id: number | null;
  default_store_id: number | null;
  name: string;
  default_price: number;
  created_at: string;
  
  // Optional data from JOINs
  category_name?: string | null;
  category_color_hex?: string | null;
  store_name?: string | null;
}

export interface CreateItemPayload {
  name: string;
  category_id?: number | null;
  default_store_id?: number | null;
  default_price?: number;
}

export interface UpdateItemPayload {
  name?: string;
  category_id?: number | null;
  default_store_id?: number | null;
  default_price?: number;
}