import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
});

redis.on('error', (error) => {
  console.error('Redis error:', error.message);
});
