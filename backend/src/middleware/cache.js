import { redis } from '../config/redis.js';

export const withCache = (ttlSeconds = 300) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);

  if (cached) {
    const parsed = JSON.parse(cached);
    return res.status(200).json({ ...parsed, meta: { ...parsed.meta, cache: 'HIT' } });
  }

  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 300) {
      await redis.set(key, JSON.stringify(body), 'EX', ttlSeconds);
    }
    return originalJson(body);
  };

  next();
};
