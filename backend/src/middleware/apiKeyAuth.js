import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { hashValue } from '../utils/security.js';
import { sendError } from '../utils/response.js';

const usageKey = (apiKeyId, day) => `usage:${apiKeyId}:${day}`;

export const requireApiKey = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  const secret = req.headers['x-api-secret'];
  if (!key || !secret) return sendError(res, 'API credentials required', 401);

  const keyHash = hashValue(key);
  const secretHash = hashValue(secret);

  const record = await prisma.apiKey.findFirst({
    where: { keyHash, secretHash, isRevoked: false },
    include: { user: { include: { subscription: true } } },
  });

  if (!record || !record.user?.isActive) return sendError(res, 'Invalid API credentials', 401);

  const today = new Date().toISOString().slice(0, 10);
  const subLimit = record.user.subscription?.requestsPerDay || 5000;
  const count = await redis.incr(usageKey(record.id, today));
  if (count === 1) await redis.expire(usageKey(record.id, today), 86400);

  if (count > subLimit) return sendError(res, 'Daily rate limit exceeded', 429, { rateLimit: { limit: subLimit, remaining: 0 } });

  req.apiClient = { user: record.user, apiKey: record, rateLimit: { limit: subLimit, remaining: subLimit - count } };
  req.rateLimit = req.apiClient.rateLimit;

  await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } });

  next();
};
