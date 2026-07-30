export interface Store {
  store_id: number;
  user_id: string;
  name: string;
  created_at: string;
}

export interface CreateStorePayload {
  name: string;
}

export interface UpdateStorePayload {
  name: string;
}

export interface StoreResponse {
  message: string;
  store: Store;
}