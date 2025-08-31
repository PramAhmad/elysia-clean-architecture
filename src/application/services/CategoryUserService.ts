/*
 * CategoryUser Use Cases - Application Layer
 * Logic bisnis aplikasi untuk CategoryUser
 */
import { CategoryUserRepository } from '../../domain/repositories/CategoryUserRepository';
import { CategoryUser, CreateCategoryUserDTO, UpdateCategoryUserDTO } from '../../domain/entities/CategoryUser';
import { cache } from '../../infrastructure/cache/redis';

export class CategoryUserService {
  constructor(private categoryUserRepository: CategoryUserRepository) {}

  /*
   * Ambil semua category users dengan pagination
   */
  async getCategoryUsers(page: number = 1, limit: number = 10) {
    const cacheKey = `category_users:list:page:${page}:limit:${limit}`;
    
    // Cek cache dulu
    let cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const offset = (page - 1) * limit;
    const categoryUsers = await this.categoryUserRepository.findAll(limit, offset);
    const total = await this.categoryUserRepository.count();
    
    const result = {
      data: categoryUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Store in cache for 5 minutes (300 seconds)
    await cache.set(cacheKey, result, 300);
    
    return result;
  }

  /*
   * Ambil category user by ID
   */
  async getCategoryUserById(id: string): Promise<CategoryUser | null> {
    const cacheKey = `category_user:${id}`;
    
    // Cek cache dulu
    let cachedData = await cache.get<CategoryUser>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const categoryUser = await this.categoryUserRepository.findById(id);
    
    if (categoryUser) {
      // Store in cache for 10 minutes (600 seconds)
      await cache.set(cacheKey, categoryUser, 600);
    }
    
    return categoryUser;
  }

  /*
   * Ambil category user by name
   */
  async getCategoryUserByName(name: string): Promise<CategoryUser | null> {
    return this.categoryUserRepository.findByName(name);
  }

  /*
   * Buat category user baru
   */
  async createCategoryUser(categoryUserData: CreateCategoryUserDTO): Promise<CategoryUser> {
    const existingCategoryUser = await this.categoryUserRepository.findByName(categoryUserData.name);
    if (existingCategoryUser) {
      throw new Error('Nama kategori sudah digunakan');
    }

    const newCategoryUser = await this.categoryUserRepository.create(categoryUserData);
    
    /**
     * Hapus cache list category users
     * Setelah create, kita hapus cache list supaya data terbaru muncul
     * Kalo gak dihapus, user akan melihat data lama karena data masih di store di redis
     */
    await cache.delPattern('category_users:list:*');
    
    return newCategoryUser;
  }

  /*
   * Update category user
   */
  async updateCategoryUser(categoryUserData: UpdateCategoryUserDTO): Promise<CategoryUser | null> {
    // Cek category user exist
    const existingCategoryUser = await this.categoryUserRepository.findById(categoryUserData.id);
    if (!existingCategoryUser) {
      throw new Error('Kategori user tidak ditemukan');
    }

    // Cek nama conflict jika nama diubah
    if (categoryUserData.name && categoryUserData.name !== existingCategoryUser.name) {
      const nameExists = await this.categoryUserRepository.findByName(categoryUserData.name);
      if (nameExists) {
        throw new Error('Nama kategori sudah digunakan');
      }
    }

    const updatedCategoryUser = await this.categoryUserRepository.update(categoryUserData);
    
    if (updatedCategoryUser) {
      /**
       * Hapus cache category user spesifik dan list cache
       */
      await cache.del(`category_user:${categoryUserData.id}`);
      await cache.delPattern('category_users:list:*');
      console.log(`🗑️ Cache invalidated for category user ${categoryUserData.id} after update`);
    }
    
    return updatedCategoryUser;
  }

  /*
   * Hapus category user
   */
  async deleteCategoryUser(id: string): Promise<boolean> {
    const categoryUser = await this.categoryUserRepository.findById(id);
    if (!categoryUser) {
      throw new Error('Kategori user tidak ditemukan');
    }

    const deleted = await this.categoryUserRepository.delete(id);
    
    if (deleted) {
      /**
       * Hapus cache category user spesifik dan list cache
       */
      await cache.del(`category_user:${id}`);
      await cache.delPattern('category_users:list:*');
      console.log(`🗑️ Cache invalidated for category user ${id} after delete`);
    }
    
    return deleted;
  }
}
