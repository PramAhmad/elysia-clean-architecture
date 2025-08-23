/*
 * Database Migration
 * Buat table category_users
 */


import { pool } from '../connection';

export async function createCategoryUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS category_users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table category_users berhasil dibuat');
}

export async function dropCategoryUsersTable() {
  await pool.query('DROP TABLE IF EXISTS category_users');
  console.log('🗑️ Table category_users berhasil dihapus');
}
