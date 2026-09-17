import { Router } from 'express';
import { login, register, getMe, logout } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

export default router;
