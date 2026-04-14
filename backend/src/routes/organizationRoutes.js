import express from 'express';
import * as organizationController from '../controllers/organizationController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin, requireOrgMember } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireOrgMember, organizationController.getOrganization);
router.get('/members', requireAdmin, organizationController.getMembers);
router.post('/members', requireAdmin, organizationController.createMember);
router.delete('/members/:id', requireAdmin, organizationController.removeMember);

export default router;
