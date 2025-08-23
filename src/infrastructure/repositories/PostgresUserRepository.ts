/*
 * User Repository Implementation - Infrastructure Layer
 * Implementasi database operations untuk User
 */
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';
import { query } from '../database/connection';

export class PostgresUserRepository implements UserRepository {
  
  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows[0]) {
      return this.mapRowToUser(result.rows[0]);
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows[0]) {
      return this.mapRowToUser(result.rows[0]);
    }
    return null;
  }

  async findAll(limit: number, offset: number): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => this.mapRowToUser(row));
  }

  async findByCategoryUserId(categoryUserId: string, limit: number, offset: number): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users WHERE category_user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [categoryUserId, limit, offset]
    );
    return result.rows.map(row => this.mapRowToUser(row));
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const result = await query(
      'INSERT INTO users (id, name, email, password, category_user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userData.name, userData.email, userData.password, userData.categoryUserId || null, now, now]
    );
    return this.mapRowToUser(result.rows[0]);
  }

  async update(userData: UpdateUserDTO): Promise<User | null> {
    const now = new Date();
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (userData.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(userData.name);
    }
    if (userData.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    if (userData.password) {
      fields.push(`password = $${paramIndex++}`);
      values.push(userData.password);
    }
    if (userData.categoryUserId !== undefined) {
      fields.push(`category_user_id = $${paramIndex++}`);
      values.push(userData.categoryUserId);
    }
    
    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(userData.id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows[0]) {
      return this.mapRowToUser(result.rows[0]);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  async countByCategoryUserId(categoryUserId: string): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users WHERE category_user_id = $1', [categoryUserId]);
    return parseInt(result.rows[0].count);
  }

  /*
   * Helper method untuk mapping database row ke User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      categoryUserId: row.category_user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
