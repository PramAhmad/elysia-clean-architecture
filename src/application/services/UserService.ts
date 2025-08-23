/*
 * User Use Cases - Application Layer
 * Logic bisnis aplikasi untuk User
 */
import { UserRepository } from '../../domain/repositories/UserRepository';
import { CategoryUserRepository } from '../../domain/repositories/CategoryUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User'; 
import { cache } from '../../infrastructure/cache/redis';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private categoryUserRepository: CategoryUserRepository
  ) {}

  /*
   * Ambil semua user dengan pagination
   */
  async getUsers(page: number = 1, limit: number = 10) {
    const cacheKey = `users:list:page:${page}:limit:${limit}`;
    
    // Cek cache dulu
    let cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log('📦 Data retrieved from cache');
      return cachedData;
    }

    console.log('📊 Data not found in cache, fetching from database...');
    const offset = (page - 1) * limit;
    const users = await this.userRepository.findAll(limit, offset);
    const total = await this.userRepository.count();
    
    const result = {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Store in cache for 5 minutes (300 seconds)
    await cache.set(cacheKey, result, 300);
    console.log('💾 Users list stored in cache');
    
    return result;
  }

  /*
   * Ambil user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // Cek cache dulu
    let cachedData = await cache.get<User>(cacheKey);
    if (cachedData) {
      console.log(`📦 User ${id} retrieved from cache`);
      return cachedData;
    }

    const user = await this.userRepository.findById(id);
    
    if (user) {
      // Store in cache for 10 minutes (600 seconds)
      await cache.set(cacheKey, user, 600);
      console.log(`💾 User ${id} stored in cache`);
    }
    
    return user;
  }

  /*
   * Ambil user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /*
   * Ambil users by category user id
   */
  async getUsersByCategoryUserId(categoryUserId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const users = await this.userRepository.findByCategoryUserId(categoryUserId, limit, offset);
    const total = await this.userRepository.countByCategoryUserId(categoryUserId);
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /*
   * Buat user baru
   */
  async createUser(userData: CreateUserDTO): Promise<User> {
    // Cek email sudah ada atau belum
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email sudah digunakan');
    }

    // Cek category user exist jika ada
    if (userData.categoryUserId) {
      const categoryUser = await this.categoryUserRepository.findById(userData.categoryUserId);
      if (!categoryUser) {
        throw new Error('Kategori user tidak ditemukan');
      }
    }

    const newUser = await this.userRepository.create(userData);
    
    // Invalidate users list cache
    await cache.delPattern('users:list:*');
    console.log('🗑️ Users list cache invalidated after create');
    
    return newUser;
  }

  /*
   * Update user
   */
  async updateUser(userData: UpdateUserDTO): Promise<User | null> {
    // Cek user exist
    const existingUser = await this.userRepository.findById(userData.id);
    if (!existingUser) {
      throw new Error('User tidak ditemukan');
    }

    // Cek email conflict jika email diubah
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(userData.email);
      if (emailExists) {
        throw new Error('Email sudah digunakan');
      }
    }

    // Cek category user exist jika ada
    if (userData.categoryUserId) {
      const categoryUser = await this.categoryUserRepository.findById(userData.categoryUserId);
      if (!categoryUser) {
        throw new Error('Kategori user tidak ditemukan');
      }
    }

    const updatedUser = await this.userRepository.update(userData);
    
    if (updatedUser) {
      // Invalidate specific user cache and list cache
      await cache.del(`user:${userData.id}`);
      await cache.delPattern('users:list:*');
      console.log(`🗑️ Cache invalidated for user ${userData.id} after update`);
    }
    
    return updatedUser;
  }

  /*
   * Hapus user
   */
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const deleted = await this.userRepository.delete(id);
    
    if (deleted) {
      // Invalidate specific user cache and list cache
      await cache.del(`user:${id}`);
      await cache.delPattern('users:list:*');
      console.log(`🗑️ Cache invalidated for user ${id} after delete`);
    }
    
    return deleted;
  }
}
