export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  extension: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  extension: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  extension?: string;
  is_active?: boolean;
  role?: 'admin' | 'user';
}