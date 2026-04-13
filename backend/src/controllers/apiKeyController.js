import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { generateApiCredentials } from '../utils/security.js';
import { sendError, sendResponse } from '../utils/response.js';

const createSchema = z.object({ name: z.string().min(3).max(80) });

export const createApiKey = async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid payload', 400);

  const generated = generateApiCredentials();
  const record = await prisma.apiKey.create({
    data: {
      userId: req.user.id,
      name: parsed.data.name,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
      secretHash: generated.secretHash,
    },
  });

  return sendResponse(
    res,
    { id: record.id, name: record.name, apiKey: generated.key, apiSecret: generated.secret, createdAt: record.createdAt },
    {},
    201,
  );
};

const revokeSchema = z.object({ apiKeyId: z.string().min(5) });

export const revokeApiKey = async (req, res) => {
  const parsed = revokeSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid payload', 400);

  const updated = await prisma.apiKey.updateMany({
    where: { id: parsed.data.apiKeyId, userId: req.user.id, isRevoked: false },
    data: { isRevoked: true, revokedAt: new Date() },
  });

  if (!updated.count) return sendError(res, 'API key not found', 404);
  return sendResponse(res, { revoked: true });
};

export const listMyApiKeys = async (req, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.user.id },
    select: { id: true, name: true, keyPrefix: true, isRevoked: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return sendResponse(res, keys);
};
