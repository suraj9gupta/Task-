import { prisma } from '../config/prisma.js';

export const writeApiLog = async ({ req, statusCode, villageId = null }) => {
  try {
    const durationMs = Number((process.hrtime.bigint() - req.startTime) / 1000000n);
    await prisma.apiLog.create({
      data: {
        userId: req.user?.id || req.apiClient?.user?.id || null,
        apiKeyId: req.apiClient?.apiKey?.id || null,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode,
        durationMs,
        query: Object.keys(req.query || {}).length ? req.query : null,
        villageId,
      },
    });
  } catch (error) {
    console.error('Failed writing api log', error.message);
  }
};
