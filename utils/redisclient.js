const Redis = require("ioredis");
require('dotenv').config();

const redis = new Redis({
  host: "localhost", 
  port: 6379,        
  retryStrategy: (times) => Math.min(times * 50, 2000), 
});
const cacheData = async (key, data, expiry = 86400) => {
  try {
    await redis.set(key, JSON.stringify(data), "EX", expiry);
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};
const getCachedData = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis retrieval error:", error);
    return null;
  }
};
const invalidateCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis invalidation error:", error);
  }
};
module.exports = { redis, cacheData, getCachedData, invalidateCache };
