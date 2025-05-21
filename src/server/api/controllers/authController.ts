import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  try {
    console.log('Received signup request:', { ...req.body, password: '[REDACTED]' });
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.error('Missing required fields');
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isAdmin: false, // Default to false for new users
        profile: {
          create: {} // Create empty profile
        }
      },
      include: {
        profile: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        profile: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('User created successfully:', { id: user.id, username: user.username });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        isAdmin: true,
        profile: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Error signing in' });
  }
};

export const signout = async (_req: Request, res: Response) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will handle removing the token
    res.json({ message: 'Successfully signed out' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Error signing out' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        profile: {
          select: {
            id: true,
            bio: true,
            avatarUrl: true,
            location: true,
            instagramUrl: true,
            facebookUrl: true,
            youtubeUrl: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware
    const { bio, location, instagramUrl, facebookUrl, youtubeUrl, avatarUrl } = req.body;

    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        bio: bio === undefined ? user.profile?.bio : bio,
        location: location === undefined ? user.profile?.location : location,
        instagramUrl: instagramUrl === undefined ? user.profile?.instagramUrl : instagramUrl,
        facebookUrl: facebookUrl === undefined ? user.profile?.facebookUrl : facebookUrl,
        youtubeUrl: youtubeUrl === undefined ? user.profile?.youtubeUrl : youtubeUrl,
        avatarUrl: avatarUrl === undefined ? user.profile?.avatarUrl : avatarUrl,
      },
    });

    // Get the updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({ 
      user: userWithoutPassword,
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
}; 