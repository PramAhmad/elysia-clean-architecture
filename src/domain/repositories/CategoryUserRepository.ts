/*
 * CategoryUser Repository Interface - Domain Layer
 * Kontrak untuk operasi database CategoryUser
 */
import { CategoryUser, CreateCategoryUserDTO, UpdateCategoryUserDTO } from '../entities/CategoryUser';

export interface CategoryUserRepository {
  findById(id: string): Promise<CategoryUser | null>;
  findByName(name: string): Promise<CategoryUser | null>;
  findAll(limit: number, offset: number): Promise<CategoryUser[]>;
  create(categoryUserData: CreateCategoryUserDTO): Promise<CategoryUser>;
  update(categoryUserData: UpdateCategoryUserDTO): Promise<CategoryUser | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}
