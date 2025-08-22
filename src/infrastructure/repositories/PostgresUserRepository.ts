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
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findAll(limit: number, offset: number): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const result = await query(
      'INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userData.name, userData.email, userData.password, now, now]
    );
    return result.rows[0];
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
    
    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(userData.id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }
}
