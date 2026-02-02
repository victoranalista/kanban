import { Redis } from '@upstash/redis';

const redisClient = Redis.fromEnv();

export const redis = redisClient;
export const redisPrefix = 'ohno:';
