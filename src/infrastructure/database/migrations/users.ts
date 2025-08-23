/*
 * Database Migration
 * Buat table users
 */

/**
 * 
 * 
 */
import { pool } from '../connection';

export async function createUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      category_user_id UUID,
      FOREIGN KEY (category_user_id) REFERENCES category_users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table users berhasil dibuat');
}

export async function dropUsersTable() {
  await pool.query('DROP TABLE IF EXISTS users');
  console.log('🗑️ Table users berhasil dihapus');
}
