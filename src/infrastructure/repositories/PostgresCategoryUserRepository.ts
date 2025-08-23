/*
 * CategoryUser Repository Implementation - Infrastructure Layer
 * Implementasi database operations untuk CategoryUser
 */
import { CategoryUserRepository } from '../../domain/repositories/CategoryUserRepository';
import { CategoryUser, CreateCategoryUserDTO, UpdateCategoryUserDTO } from '../../domain/entities/CategoryUser';
import { query } from '../database/connection';

export class PostgresCategoryUserRepository implements CategoryUserRepository {
  
  async findById(id: string): Promise<CategoryUser | null> {
    const result = await query('SELECT * FROM category_users WHERE id = $1', [id]);
    if (result.rows[0]) {
      return this.mapRowToCategoryUser(result.rows[0]);
    }
    return null;
  }

  async findByName(name: string): Promise<CategoryUser | null> {
    const result = await query('SELECT * FROM category_users WHERE name = $1', [name]);
    if (result.rows[0]) {
      return this.mapRowToCategoryUser(result.rows[0]);
    }
    return null;
  }

  async findAll(limit: number, offset: number): Promise<CategoryUser[]> {
    const result = await query(
      'SELECT * FROM category_users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map(row => this.mapRowToCategoryUser(row));
  }

  async create(categoryUserData: CreateCategoryUserDTO): Promise<CategoryUser> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const result = await query(
      'INSERT INTO category_users (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, categoryUserData.name, categoryUserData.description || null, now, now]
    );
    return this.mapRowToCategoryUser(result.rows[0]);
  }

  async update(categoryUserData: UpdateCategoryUserDTO): Promise<CategoryUser | null> {
    const now = new Date();
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (categoryUserData.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(categoryUserData.name);
    }
    if (categoryUserData.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(categoryUserData.description);
    }
    
    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(categoryUserData.id);

    const result = await query(
      `UPDATE category_users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    if (result.rows[0]) {
      return this.mapRowToCategoryUser(result.rows[0]);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM category_users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM category_users');
    return parseInt(result.rows[0].count);
  }

  /*
   * Helper method untuk mapping database row ke CategoryUser object
   */
  private mapRowToCategoryUser(row: any): CategoryUser {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
