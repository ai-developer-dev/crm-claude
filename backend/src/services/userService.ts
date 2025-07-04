import { query } from '../config/database';
import { User, CreateUserInput, UpdateUserInput } from '../models/user';
import { hashPassword, comparePassword } from '../utils/auth';

export class UserService {
  static async createUser(userData: CreateUserInput): Promise<User> {
    const { name, email, password, extension, role = 'user' } = userData;
    
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Check if extension already exists
    const existingExtension = await this.findByExtension(extension);
    if (existingExtension) {
      throw new Error('Extension already in use');
    }
    
    const passwordHash = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO users (name, email, password_hash, extension, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, extension, is_active, role, created_at, updated_at`,
      [name, email, passwordHash, extension, role]
    );
    
    return result.rows[0];
  }
  
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }
  
  static async findByExtension(extension: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE extension = $1',
      [extension]
    );
    
    return result.rows[0] || null;
  }
  
  static async getAllUsers(): Promise<User[]> {
    const result = await query(
      'SELECT id, name, email, extension, is_active, role, created_at, updated_at FROM users ORDER BY name'
    );
    
    return result.rows;
  }
  
  static async updateUser(id: string, userData: UpdateUserInput): Promise<User | null> {
    const { name, email, extension, is_active, role } = userData;
    
    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await this.findByEmail(email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use by another user');
      }
    }
    
    // Check if extension is being changed and if it's already taken
    if (extension) {
      const existingExtension = await this.findByExtension(extension);
      if (existingExtension && existingExtension.id !== id) {
        throw new Error('Extension already in use by another user');
      }
    }
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      setClause.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email !== undefined) {
      setClause.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (extension !== undefined) {
      setClause.push(`extension = $${paramCount++}`);
      values.push(extension);
    }
    if (is_active !== undefined) {
      setClause.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (role !== undefined) {
      setClause.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    if (setClause.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, email, extension, is_active, role, created_at, updated_at`,
      values
    );
    
    return result.rows[0] || null;
  }
  
  static async deleteUser(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    return result.rowCount! > 0;
  }
  
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }
}