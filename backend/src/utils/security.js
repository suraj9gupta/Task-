import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { env } from '../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const signJwt = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
export const verifyJwt = (token) => jwt.verify(token, env.jwtSecret);

export const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

export const generateApiCredentials = () => {
  const key = `iva_${nanoid(24)}`;
  const secret = `ivs_${nanoid(36)}`;
  return {
    key,
    secret,
    keyPrefix: key.slice(0, 12),
    keyHash: hashValue(key),
    secretHash: hashValue(secret),
  };
};
