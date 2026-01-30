export interface User {
  id: number;
  email: string;
  full_name: string;
  password: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
}

export interface Feedback {
  id: number;
  user_id: number;
  comment: string | null;
  rating: number | null;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  id?: number;
  updated?: number;
  deleted?: number;
  error?: string;
}