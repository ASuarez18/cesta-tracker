export type ListStatus = 'OPEN' | 'CLOSED';

export interface ListItem {
  list_item_id: number;      // M:N relationship table ID
  list_id: number;
  item_id: number;
  quantity: number;
  price_at_purchase: number;
  is_completed: boolean;
  
  // Item data from JOINs
  item_name?: string;
  category_id?: number | null;
  category_name?: string | null;
  category_color_hex?: string | null;
}

export interface ShoppingList {
  list_id: number;
  user_id: string;
  title: string;
  status: ListStatus;
  budget: number | null;
  created_at: string;
  closed_at: string | null;
  
  // Calculated fields from JOINs
  total_estimated?: number;
  total_completed?: number;
  items_count?: number;
  items?: ListItem[];
}

export interface CreateListPayload {
  title: string;
  budget?: number | null;
}

export interface AddItemToListPayload {
  item_id: number;
  quantity?: number;
  price_at_purchase?: number;
}

export interface UpdateListItemPayload {
  quantity?: number;
  price_at_purchase?: number;
  is_completed?: boolean;
}

export interface ShoppingListResponse {
  message: string;
  list: ShoppingList;
}

export interface ListItemResponse {
  message: string;
  list_item: ListItem;
}