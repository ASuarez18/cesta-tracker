export interface User {
  id: string; // user_id UUID
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}