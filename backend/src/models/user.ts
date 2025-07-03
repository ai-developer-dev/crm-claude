export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  extension: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  extension: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  extension?: string;
  is_active?: boolean;
}