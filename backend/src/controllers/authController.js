import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword, signJwt } from '../utils/security.js';
import { sendError, sendResponse } from '../utils/response.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid payload', 400);

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return sendError(res, 'Email already exists', 409);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      subscription: { create: { plan: 'FREE', requestsPerDay: 5000 } },
    },
  });

  const token = signJwt({ userId: user.id, role: user.role });
  return sendResponse(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, {}, 201);
};

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Invalid payload', 400);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, include: { subscription: true } });
  if (!user) return sendError(res, 'Invalid credentials', 401);

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) return sendError(res, 'Invalid credentials', 401);

  const token = signJwt({ userId: user.id, role: user.role });
  return sendResponse(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    subscription: user.subscription,
  });
};
