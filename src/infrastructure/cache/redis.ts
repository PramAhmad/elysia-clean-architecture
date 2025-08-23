/*
 * Redis Connection - Simple ioredis implementation
 */
import Redis from 'ioredis';

// Create Redis instance
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

// Event listeners
redis.on('connect', () => {
  console.log('🔗 Connected to Redis');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  console.log('✅ Redis ready to use');
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

/**
 * Helper functions yang digunakan untuk operasi cache
 * Secara umum ada beberapa fungsi yang sering digunakan
 * seperti get, set, delete, exists, delPattern, dan flush.
 * Fungsi-fungsi ini akan menangani operasi cache dengan Redis.
 * get -> Mengambil data dari cache
 * set -> Menyimpan data ke cache dengan TTL
 * del -> Menghapus data dari cache
 * exists -> Mengecek apakah key ada di cache
 * delPattern -> Menghapus beberapa key berdasarkan pola
 * flush -> Menghapus semua data di cache
 * 
 * Di get dan set ada beberapa parameter:
 * - key: string - Kunci untuk menyimpan atau mengambil data
 * - value: any - Data yang akan disimpan (hanya di set)
 * - ttl: number - Waktu hidup data dalam detik (default 3600 det
 * 
 * Di set, jika ttl tidak diberikan, maka data akan disimpan
 * tanpa batas waktu (default Redis behavior).
 * 
 * 
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ Cache get error for key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ Cache set error for key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`❌ Cache delete error for key ${key}:`, error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`❌ Cache delete pattern error for ${pattern}:`, error);
    }
  },

  async flush(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (error) {
      console.error('❌ Cache flush error:', error);
    }
  }
};
