import { prisma } from '../config/prisma.js';
import { verifyJwt } from '../utils/security.js';
import { sendError } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return sendError(res, 'Missing Bearer token', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || !user.isActive) {
      return sendError(res, 'Unauthorized', 401);
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 'Invalid token', 401);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 'Admin access required', 403);
  }
  return next();
};
