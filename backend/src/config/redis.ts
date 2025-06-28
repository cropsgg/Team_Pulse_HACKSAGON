import Redis from 'ioredis';
import { logger } from '@/utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Redis connection options
const redisOptions = {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  ...(REDIS_PASSWORD && { password: REDIS_PASSWORD }),
};

// Main Redis client for general caching
export const redisClient = new Redis(REDIS_URL, {
  ...redisOptions,
  keyPrefix: 'impact:',
});

// Separate Redis client for Bull job queues
export const redisQueueClient = new Redis(REDIS_URL, {
  ...redisOptions,
  keyPrefix: 'impact:queue:',
});

// Separate Redis client for pub/sub (Socket.io)
export const redisPubSubClient = new Redis(REDIS_URL, {
  ...redisOptions,
  keyPrefix: 'impact:pubsub:',
});

export const connectRedis = async (): Promise<void> => {
  try {
    // Connect all Redis clients
    await Promise.all([
      redisClient.connect(),
      redisQueueClient.connect(),
      redisPubSubClient.connect(),
    ]);
    
    logger.info('✅ Connected to Redis successfully');
    
    // Event handlers for main client
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
    
    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
    
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

export const closeRedis = async (): Promise<void> => {
  try {
    await Promise.all([
      redisClient.disconnect(),
      redisQueueClient.disconnect(),
      redisPubSubClient.disconnect(),
    ]);
    logger.info('✅ Redis connections closed successfully');
  } catch (error) {
    logger.error('❌ Error closing Redis connections:', error);
    throw error;
  }
};

// Cache utility functions
export class CacheService {
  private client: Redis;
  
  constructor(client: Redis = redisClient) {
    this.client = client;
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }
  
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists check error for key ${key}:`, error);
      return false;
    }
  }
  
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.client.incrby(key, value);
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }
  
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      await this.client.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }
  
  async flushPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch (error) {
      logger.error(`Cache flush pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }
  
  async health(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Create global cache service instance
export const cacheService = new CacheService(redisClient);

// Cache keys constants
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  NGO: (id: string) => `ngo:${id}`,
  STARTUP: (id: string) => `startup:${id}`,
  PROJECT: (id: string) => `project:${id}`,
  DONATION: (id: string) => `donation:${id}`,
  MILESTONE: (id: string) => `milestone:${id}`,
  ANALYTICS: (type: string, period: string) => `analytics:${type}:${period}`,
  AI_SCREENING: (hash: string) => `ai:screening:${hash}`,
  VOTE_SESSION: (id: string) => `vote:session:${id}`,
  QA_PAIR: (hash: string) => `qa:${hash}`,
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  SESSION: (token: string) => `session:${token}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  PERMANENT: -1, // No expiration
} as const; 