/*
 * Migration Runner
 * Jalankan semua migrations
 */
import { createCategoryUsersTable } from './category_users';
import { createUsersTable } from './users';

async function runMigrations() {
  try {
    console.log('🚀 Menjalankan migrations...');
    
    await createCategoryUsersTable();
    await createUsersTable();
    
    console.log('✅ Semua migrations berhasil dijalankan');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error menjalankan migrations:', error);
    process.exit(1);
  }
}

runMigrations();
