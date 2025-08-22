/*
 * User Repository Interface - Domain Layer
 * Kontrak untuk operasi database User
 */
import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit: number, offset: number): Promise<User[]>;
  create(userData: CreateUserDTO): Promise<User>;
  update(userData: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
