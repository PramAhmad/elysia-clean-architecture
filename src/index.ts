/*
 * Main Application File
 * Entry point aplikasi dengan clean architecture
 */
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

// Infrastructure Layer
import { PostgresUserRepository } from "./infrastructure/repositories/PostgresUserRepository";
import { PostgresCategoryUserRepository } from "./infrastructure/repositories/PostgresCategoryUserRepository";
import { redis, cache } from "./infrastructure/cache/redis";

// Application Layer  
import { UserService } from "./application/services/UserService";
import { CategoryUserService } from "./application/services/CategoryUserService";

// Presentation Layer
import { createUserController } from "./presentation/controllers/UserController";
import { createCategoryUserController } from "./presentation/controllers/CategoryUserController";

/*
 * Dependency Injection
 * Setup semua dependencies secara manual (simple DI)
 */
const userRepository = new PostgresUserRepository();
const categoryUserRepository = new PostgresCategoryUserRepository();
const userService = new UserService(userRepository, categoryUserRepository);
const categoryUserService = new CategoryUserService(categoryUserRepository);
const userController = createUserController(userService);
const categoryUserController = createCategoryUserController(categoryUserService);

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
        description: 'API dengan clean architecture pattern dan Redis caching'
      },
      tags: [
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Category Users', description: 'Category User management endpoints' },
        { name: 'Cache', description: 'Cache management endpoints' }
      ]
    }
  }))
  
  /*
   * Health check endpoint
   */
  .get("/", async () => ({
    message: "🦊 Elysia Clean Architecture API",
    status: "running",
    redis: redis.status,
    timestamp: new Date().toISOString()
  }))
  
  /*
   * Cache management endpoints
   */
  .get("/cache/status", async () => ({
    redis_status: redis.status,
    timestamp: new Date().toISOString()
  }), {
    detail: {
      tags: ["Cache"],
      summary: "Check Redis cache status"
    }
  })
  
  .delete("/cache/flush", async () => {
    try {
      await cache.flush();
      return { 
        message: "🗑️ All cache cleared successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        error: "Failed to clear cache",
        details: error 
      };
    }
  }, {
    detail: {
      tags: ["Cache"],
      summary: "Clear all cache"
    }
  })
  
  .delete("/cache/users", async () => {
    try {
      await cache.delPattern('user*');
      return { 
        message: "🗑️ Users cache cleared successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        error: "Failed to clear users cache",
        details: error 
      };
    }
  }, {
    detail: {
      tags: ["Cache"],
      summary: "Clear users cache"
    }
  })
  
  .delete("/cache/category-users", async () => {
    try {
      await cache.delPattern('category_user*');
      return { 
        message: "🗑️ Category users cache cleared successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        error: "Failed to clear category users cache",
        details: error 
      };
    }
  }, {
    detail: {
      tags: ["Cache"],
      summary: "Clear category users cache"
    }
  })
  
  /*
   * Register routes
   */
  .use(userController)
  .use(categoryUserController)
  
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

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  try {
    await redis.disconnect();
    console.log('✅ Redis connection closed');
  } catch (error) {
    console.error('❌ Error Redis connection:', error);
  }
  process.exit(0);
});
