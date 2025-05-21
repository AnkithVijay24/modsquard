import { Router } from 'express';
import { upload, uploadAvatar } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

export default router; 