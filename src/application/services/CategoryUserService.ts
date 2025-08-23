/*
 * CategoryUser Use Cases - Application Layer
 * Logic bisnis aplikasi untuk CategoryUser
 */
import { CategoryUserRepository } from '../../domain/repositories/CategoryUserRepository';
import { CategoryUser, CreateCategoryUserDTO, UpdateCategoryUserDTO } from '../../domain/entities/CategoryUser';

export class CategoryUserService {
  constructor(private categoryUserRepository: CategoryUserRepository) {}

  /*
   * Ambil semua category users dengan pagination
   */
  async getCategoryUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const categoryUsers = await this.categoryUserRepository.findAll(limit, offset);
    const total = await this.categoryUserRepository.count();
    
    return {
      data: categoryUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /*
   * Ambil category user by ID
   */
  async getCategoryUserById(id: string): Promise<CategoryUser | null> {
    return this.categoryUserRepository.findById(id);
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
    // Cek nama sudah ada atau belum
    const existingCategoryUser = await this.categoryUserRepository.findByName(categoryUserData.name);
    if (existingCategoryUser) {
      throw new Error('Nama kategori sudah digunakan');
    }

    return this.categoryUserRepository.create(categoryUserData);
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

    return this.categoryUserRepository.update(categoryUserData);
  }

  /*
   * Hapus category user
   */
  async deleteCategoryUser(id: string): Promise<boolean> {
    const categoryUser = await this.categoryUserRepository.findById(id);
    if (!categoryUser) {
      throw new Error('Kategori user tidak ditemukan');
    }

    return this.categoryUserRepository.delete(id);
  }
}
