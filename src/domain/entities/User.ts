/*
 * User Entity - Domain Layer
 * Struktur data utama untuk User
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  categoryUserId?: string; 
  createdAt: Date;
  updatedAt: Date;
}

/*
 * DTO = Data Transfer Object
 * 
 * Fungsi DTO:
 * - Objek yang digunakan untuk transfer data antar layer
 * - Memastikan data yang masuk/keluar sesuai format yang diinginkan
 * - Validasi input dari user
 */


/*
 * DTO untuk buat user baru
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  categoryUserId?: string; 
}

/**
 * Btw kalian juga bisa pake OmmitType di typescript buat ngilangin field tertentu
 */

/*
 * DTO untuk update user
 */
export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  categoryUserId?: string;
}
