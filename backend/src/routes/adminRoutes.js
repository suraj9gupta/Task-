import { Router } from 'express';
import { analytics, listLogs, listUsers } from '../controllers/adminController.js';

const router = Router();
router.get('/users', listUsers);
router.get('/logs', listLogs);
router.get('/analytics', analytics);

export default router;
