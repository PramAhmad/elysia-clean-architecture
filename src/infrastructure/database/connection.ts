/*
 * Database Connection - Infrastructure Layer
 * Setup koneksi PostgreSQL
 */
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'elysia_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export { pool };
