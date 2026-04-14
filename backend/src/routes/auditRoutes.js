import express from 'express';
import * as auditController from '../controllers/auditController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', requireAdmin, auditController.getAuditLogs);

export default router;
