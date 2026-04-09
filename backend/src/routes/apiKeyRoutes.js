import { Router } from 'express';
import { createApiKey, listMyApiKeys, revokeApiKey } from '../controllers/apiKeyController.js';

const router = Router();

router.get('/', listMyApiKeys);
router.post('/create', createApiKey);
router.delete('/revoke', revokeApiKey);

export default router;
