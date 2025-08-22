/*
 * User Use Cases - Application Layer
 * Logic bisnis aplikasi untuk User
 */
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User'; 

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /*
   * Ambil semua user dengan pagination
   */
  async getUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const users = await this.userRepository.findAll(limit, offset);
    const total = await this.userRepository.count();
    
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
   * Ambil user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /*
   * Ambil user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
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

    return this.userRepository.create(userData);
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

    return this.userRepository.update(userData);
  }

  /*
   * Hapus user
   */
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    return this.userRepository.delete(id);
  }
}
