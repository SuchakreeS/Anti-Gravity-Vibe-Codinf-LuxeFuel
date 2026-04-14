import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/register-org', authController.registerOrganization);
router.post('/login', authController.login);

export default router;
