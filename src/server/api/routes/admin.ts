import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Admin-only middleware
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAdmin: true
      }
    });

    if (!user?.isAdmin) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            location: true,
            avatarUrl: true,
            instagramUrl: true,
            facebookUrl: true,
            youtubeUrl: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user stats (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, adminUsers, totalVehicles] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          isAdmin: true
        }
      }),
      prisma.build.count()
    ]);
    
    const regularUsers = totalUsers - adminUsers;

    res.json({
      totalVehicles,
      regularUsers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router; 