import { Router } from 'express';
import { signup, signin, signout, getCurrentUser, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);

export default router; 