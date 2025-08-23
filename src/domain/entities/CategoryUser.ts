export interface CategoryUser {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

/*
 * DTO untuk buat kategori user baru
 */
export interface CreateCategoryUserDTO {
  name: string;
  description?: string;
}

/*
 * DTO untuk update kategori user
 */
export interface UpdateCategoryUserDTO {
    id: string;
    name?: string;
    description?: string;
}