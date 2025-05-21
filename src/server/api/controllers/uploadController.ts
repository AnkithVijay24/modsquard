import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  userId?: string;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

export const uploadAvatar = async (req: Request & { userId?: string, file?: Express.Multer.File }, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get the file path relative to the public directory
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    try {
      // Update user's profile with new avatar URL
      const updatedProfile = await prisma.profile.update({
        where: {
          userId: userId,
        },
        data: {
          avatarUrl: avatarUrl,
        },
      });

      // Get the updated user with profile
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!updatedUser) {
        // If user not found, try to clean up the uploaded file
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', req.file.filename);
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({ 
        user: userWithoutPassword,
        profile: updatedProfile,
        url: avatarUrl 
      });
    } catch (dbError) {
      console.error('Database error during avatar upload:', dbError);
      // If database update fails, try to clean up the uploaded file
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', req.file.filename);
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload avatar' });
  }
}; 