import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true }
    });

    if (!requestingUser?.isAdmin) {
      res.status(403).json({ error: 'Unauthorized: Admin access required' });
      return;
    }

    // Fetch all users with their profiles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        isAdmin: true,
        profile: {
          select: {
            bio: true,
            location: true,
            avatarUrl: true,
            instagramUrl: true,
            facebookUrl: true,
            youtubeUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request & { userId?: string }, res: Response): Promise<void> => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true }
    });

    if (!requestingUser?.isAdmin) {
      res.status(403).json({ error: 'Unauthorized: Admin access required' });
      return;
    }

    const userIdToDelete = req.params.userId;

    // Check if the user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { isAdmin: true }
    });

    if (!userToDelete) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deleting another admin
    if (userToDelete.isAdmin) {
      res.status(403).json({ error: 'Cannot delete admin users' });
      return;
    }

    // Delete the user's profile first (due to foreign key constraint)
    await prisma.profile.delete({
      where: { userId: userIdToDelete }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userIdToDelete }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 