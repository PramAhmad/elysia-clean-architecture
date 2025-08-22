/*
 * Main Application File
 * Entry point aplikasi dengan clean architecture
 */
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

// Infrastructure Layer
import { PostgresUserRepository } from "./infrastructure/repositories/PostgresUserRepository";

// Application Layer  
import { UserService } from "./application/services/UserService";

// Presentation Layer
import { createUserController } from "./presentation/controllers/UserController";

/*
 * Dependency Injection
 * Setup semua dependencies secara manual (simple DI)
 */
const userRepository = new PostgresUserRepository();
const userService = new UserService(userRepository);
const userController = createUserController(userService);

/*
 * Setup Elysia App
 */
const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Elysia Clean Architecture API',
        version: '1.0.0',
        description: 'API dengan clean architecture pattern'
      },
      tags: [
        { name: 'Users', description: 'User management endpoints' }
      ]
    }
  }))
  
  /*
   * Health check endpoint
   */
  .get("/", () => ({
    message: "🦊 Elysia Clean Architecture API",
    status: "running",
    timestamp: new Date().toISOString()
  }))
  
  /*
   * Register User routes
   */
  .use(userController)
  
  /*
   * Error handler
   */
  .onError(({ code, error, set }) => {
    console.error('Error:', error);
    
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { error: 'Data tidak valid' };
      case 'NOT_FOUND':
        set.status = 404;
        return { error: 'Endpoint tidak ditemukan' };
      default:
        set.status = 500;
        return { error: 'Internal server error' };
    }
  })
  
  .listen(process.env.PORT || 3000);

console.log(`🚀 Server berjalan di http://localhost:${app.server?.port}`);
console.log(`📚 API Documentation: http://localhost:${app.server?.port}/swagger`);
