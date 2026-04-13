import { prisma } from '../config/prisma.js';
import { getPagination } from '../utils/pagination.js';
import { sendResponse } from '../utils/response.js';

export const listUsers = async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        subscription: { select: { plan: true, requestsPerDay: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  return sendResponse(res, users, { pagination: { total, page, limit } });
};

export const listLogs = async (req, res) => {
  const { skip, limit, page } = getPagination(req.query);
  const [logs, total] = await Promise.all([
    prisma.apiLog.findMany({
      include: { user: { select: { id: true, email: true } }, apiKey: { select: { id: true, keyPrefix: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.apiLog.count(),
  ]);

  return sendResponse(res, logs, { pagination: { total, page, limit } });
};

export const analytics = async (req, res) => {
  const [users, keys, totalLogs, activeToday] = await Promise.all([
    prisma.user.count(),
    prisma.apiKey.count({ where: { isRevoked: false } }),
    prisma.apiLog.count(),
    prisma.apiLog.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
  ]);

  return sendResponse(res, { users, activeKeys: keys, totalLogs, requestsLast24h: activeToday });
};
