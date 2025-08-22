# 🦊 Elysia HTTP Server - Clean Architecture

API REST server menggunakan [Elysia.js](https://elysiajs.com/) dengan implementasi **Clean Architecture** pattern dan TypeScript.

## 📋 Daftar Isi

- [Gambaran Umum](#-gambaran-umum)
- [Arsitektur](#-arsitektur)
- [Struktur Folder](#-struktur-folder)
- [Layer Architecture](#-layer-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Migration](#-database-migration)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [API Documentation](#-api-documentation)
- [Contoh Penggunaan API](#-contoh-penggunaan-api)
- [Best Practices](#-best-practices)

## 🎯 Gambaran Umum

Project ini adalah implementasi REST API dengan menggunakan **Clean Architecture** yang memisahkan concerns ke dalam layer-layer yang berbeda. Hal ini membuat aplikasi lebih:

- **Maintainable** - Mudah dipelihara dan dikembangkan
- **Testable** - Layer bisnis dapat ditest secara independen
- **Scalable** - Mudah untuk menambah fitur baru
- **Flexible** - Mudah mengganti implementasi database atau framework

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
│  ┌─────────────────┐     ┌─────────────────────────────┐   │
│  │  Controllers    │────▶│      HTTP Requests          │   │
│  │  (UserController)│     │   (Routes & Validation)     │   │
│  └─────────────────┘     └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                        │
│  ┌─────────────────┐     ┌─────────────────────────────┐   │
│  │   Services      │────▶│      Business Logic         │   │
│  │  (UserService)  │     │   (Use Cases & Rules)       │   │
│  └─────────────────┘     └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                            │
│  ┌─────────────────┐     ┌─────────────────────────────┐   │
│  │   Entities      │     │     Repositories            │   │
│  │    (User)       │     │   (UserRepository)          │   │
│  └─────────────────┘     └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                       │
│  ┌─────────────────┐     ┌─────────────────────────────┐   │
│  │  Repositories   │     │       Database              │   │
│  │(PostgresUserRepo)│────▶│   (PostgreSQL + Pool)       │   │
│  └─────────────────┘     └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Struktur Folder

```
src/
├── index.ts                      # Entry point aplikasi
├── application/                  # APPLICATION LAYER
│   └── services/
│       └── UserService.ts        # Business logic & use cases
├── domain/                       # DOMAIN LAYER (Core Business)
│   ├── entities/
│   │   └── User.ts              # Domain entities & DTOs
│   └── repositories/
│       └── UserRepository.ts     # Repository contracts/interfaces
├── infrastructure/               # INFRASTRUCTURE LAYER
│   ├── database/
│   │   ├── connection.ts        # Database connection setup
│   │   └── migrations/
│   │       ├── run.ts           # Migration runner
│   │       └── users.ts         # User table migration
│   └── repositories/
│       └── PostgresUserRepository.ts # Repository implementation
└── presentation/                 # PRESENTATION LAYER
    └── controllers/
        └── UserController.ts     # HTTP controllers & routes
```

## 🏛️ Layer Architecture

### 1. **Domain Layer** (Core/Entities)
**Lokasi**: `src/domain/`

Layer paling dalam yang berisi business entities dan rules inti aplikasi.

**Komponen**:
- **Entities** (`User.ts`): Struktur data utama dan business objects
- **Repository Interfaces** (`UserRepository.ts`): Kontrak untuk data access
- **DTOs**: Data Transfer Objects untuk input/output

**Karakteristik**:
- ❌ **Tidak bergantung** pada layer lain
- ✅ **Pure business logic** tanpa framework dependencies
- ✅ **Highly testable** karena tidak ada external dependencies

### 2. **Application Layer** (Use Cases)
**Lokasi**: `src/application/`

Layer yang mengorchestrate business logic dan use cases aplikasi.

**Komponen**:
- **Services** (`UserService.ts`): Implementasi use cases dan business rules

**Karakteristik**:
- ✅ **Depends on**: Domain Layer
- ❌ **Independent from**: Infrastructure & Presentation
- ✅ **Contains**: Application-specific business rules
- ✅ **Orchestrates**: Flow between domain objects

### 3. **Infrastructure Layer** (Data Access)
**Lokasi**: `src/infrastructure/`

Layer yang menghandle external concerns seperti database, file system, external APIs.

**Komponen**:
- **Database Connection** (`connection.ts`): Setup koneksi PostgreSQL
- **Repository Implementations** (`PostgresUserRepository.ts`): Konkrit implementasi dari repository interfaces
- **Migrations** (`migrations/`): Database schema management

**Karakteristik**:
- ✅ **Implements**: Domain repository interfaces
- ✅ **Handles**: External data sources & APIs
- ✅ **Contains**: Framework-specific code

### 4. **Presentation Layer** (Controllers)
**Lokasi**: `src/presentation/`

Layer yang menghandle HTTP requests, routing, dan user interface concerns.

**Komponen**:
- **Controllers** (`UserController.ts`): HTTP route handlers
- **Validation**: Request/response validation using Elysia's type system

**Karakteristik**:
- ✅ **Handles**: HTTP requests & responses
- ✅ **Validates**: Input data
- ✅ **Translates**: HTTP concerns to application layer calls

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Elysia.js](https://elysiajs.com/) - Fast and friendly Bun web framework
- **Database**: PostgreSQL dengan connection pooling
- **Language**: TypeScript untuk type safety
- **Validation**: Elysia's built-in type system dengan Zod
- **API Docs**: Swagger/OpenAPI integration

**Dependencies**:
```json
{
  "elysia": "latest",
  "pg": "^3.4.3",
  "@elysiajs/cors": "latest", 
  "@elysiajs/swagger": "latest",
  "zod": "^3.22.4"
}
```

## 🚀 Installation

1. **Clone repository**:
```bash
git clone <repository-url>
cd elysia-http-server
```

2. **Install dependencies**:
```bash
bun install
```

3. **Setup database**:
- Install PostgreSQL
- Buat database baru:
```sql
CREATE DATABASE elysia_db;
```

## 🔧 Environment Variables

Buat file `.env` di root project:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elysia_db
DB_USER=postgres
DB_PASSWORD=password

# Server Configuration  
PORT=3000
```

## �️ Database Migration

Jalankan migration untuk membuat table users:

```bash
bun run db:migrate
```

File migration ada di `src/infrastructure/database/migrations/users.ts` yang akan membuat table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎮 Menjalankan Aplikasi

**Development mode** (dengan auto-reload):
```bash
bun run dev
```

**Production mode**:
```bash
bun run start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Documentation

Swagger documentation tersedia di: `http://localhost:3000/swagger`

### Endpoints Tersedia:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/users` | Get all users (dengan pagination) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

## 🧪 Contoh Penggunaan API

### 1. Health Check
```bash
curl http://localhost:3000/
```

### 2. Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pramu",
    "email": "pramu@example.com", 
    "password": "password123"
  }'
```

### 3. Get All Users (dengan pagination)
```bash
curl "http://localhost:3000/users?page=1&limit=10"
```

### 4. Get User by ID
```bash
curl http://localhost:3000/users/{user-id}
```

### 5. Update User
```bash
curl -X PUT http://localhost:3000/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe Updated"
  }'
```

### 6. Delete User
```bash
curl -X DELETE http://localhost:3000/users/{user-id}
```

## 💡 Best Practices

### 1. **Dependency Direction**
```
Presentation ───▶ Application ───▶ Domain
     │                              ▲
     └─────────▶ Infrastructure ────┘
```

- Outer layers depend on inner layers
- Inner layers tidak tahu tentang outer layers
- Domain layer adalah core yang independent

### 2. **Dependency Injection**
```typescript
// Manual DI di index.ts
const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);
const userController = createUserController(userService);
```

### 3. **Error Handling**
- Business logic errors di Service layer
- HTTP-specific errors di Controller layer
- Database errors di Repository layer

### 4. **Validation**
- Input validation di Presentation layer
- Business rules validation di Application layer
- Data integrity di Infrastructure layer

### 5. **Testing Strategy**
```
├── Unit Tests
│   ├── Domain entities
│   └── Application services (dengan mock repositories)
├── Integration Tests  
│   └── Infrastructure repositories (dengan test database)
└── E2E Tests
    └── API endpoints (full stack)
```

## 🔄 Flow Aplikasi

1. **HTTP Request** masuk ke **Controller** (Presentation)
2. **Controller** memanggil **Service** (Application) 
3. **Service** menggunakan **Repository interface** (Domain)
4. **Repository implementation** (Infrastructure) akses database
5. **Response** dikembalikan melalui layer yang sama

## 🏆 Keuntungan Arsitektur Ini

1. **Separation of Concerns** - Setiap layer punya tanggung jawab yang jelas
2. **Testability** - Business logic dapat ditest tanpa database
3. **Flexibility** - Mudah ganti database atau framework  
4. **Maintainability** - Perubahan di satu layer tidak affect layer lain
5. **Scalability** - Mudah menambah fitur baru

---

**Happy Code!** 🎉

Untuk pertanyaan atau kontribusi, silakan buat issue di repository ini.