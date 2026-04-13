import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { requireAdmin, requireAuth } from './middleware/auth.js';
import { requireApiKey } from './middleware/apiKeyAuth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestMeta } from './middleware/requestMeta.js';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { sendResponse } from './utils/response.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(requestMeta);
app.use(rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => sendResponse(res, { status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', requireApiKey, locationRoutes);
app.use('/api/v1/api-keys', requireAuth, apiKeyRoutes);
app.use('/api/v1/admin', requireAuth, requireAdmin, adminRoutes);

app.use(errorHandler);

export default app;
