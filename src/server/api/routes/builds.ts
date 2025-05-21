import { Router } from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES modules replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface AuthenticatedRequest extends Request {
  userId?: string;
}

type AuthenticatedRequestHandler = RequestHandler<
  any,
  any,
  any,
  any,
  { userId?: string }
>;

interface BuildUpdateData {
  title?: string;
  description?: string;
  carYear?: number;
  carMake?: string;
  carModel?: string;
}

const router = Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
});

// Get all builds for the authenticated user
const getAllBuilds: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId;
    console.log('Fetching builds for user:', userId);
    
    const builds = await prisma.build.findMany({
      where: { userId },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Found builds:', builds);
    res.json(builds);
  } catch (error) {
    console.error('Error fetching builds:', error);
    next(error);
  }
};

// Create a new build with images
const createBuild: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log('Received build creation request:', req.body);
    const { title, description, carMake, carModel, carYear, buildId } = req.body;
    const userId = req.userId;
    const files = req.files as Express.Multer.File[];

    console.log('Files received:', files?.length);
    console.log('Build data:', { title, description, carMake, carModel, carYear, buildId });

    if (!userId) {
      console.error('No userId found in request');
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!files || files.length === 0) {
      console.error('No images received');
      res.status(400).json({ error: 'At least one image is required' });
      return;
    }

    // Create the build with images
    const build = await prisma.build.create({
      data: {
        title: title || 'New Build',
        description: description || 'My vehicle build',
        userId,
        carMake: carMake || 'Unknown',
        carModel: carModel || 'Unknown',
        carYear: parseInt(carYear) || new Date().getFullYear(),
        images: {
          create: files.map(file => ({
            url: `/uploads/${file.filename}`,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    console.log('Created build:', build);
    res.status(201).json(build);
  } catch (error) {
    console.error('Error creating build:', error);
    // Clean up uploaded files if build creation fails
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(error);
  }
};

// Get a specific build
const getBuild: AuthenticatedRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const build = await prisma.build.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        images: true,
        modifications: true,
        comments: {
          include: {
            user: {
              select: {
                username: true,
                profile: {
                  select: {
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        likes: true,
      },
    });

    if (!build) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    res.json(build);
  } catch (error) {
    next(error);
  }
};

// Update a build
const updateBuild: AuthenticatedRequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const files = req.files as Express.Multer.File[] | undefined;
    const updateData = req.body as BuildUpdateData;

    console.log('Received update request:', {
      id,
      userId,
      updateData,
      files: files?.length
    });

    // First check if the build exists and belongs to the user
    const existingBuild = await prisma.build.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        images: true
      }
    });

    if (!existingBuild) {
      console.log('Build not found or unauthorized:', { id, userId });
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    // Process carYear to ensure it's a number
    const processedData: BuildUpdateData = {
      ...updateData,
      carYear: updateData.carYear ? parseInt(updateData.carYear.toString()) : undefined,
    };

    console.log('Processing update with data:', processedData);

    // Handle image updates if files are present
    let imageUpdates = {};
    if (files && files.length > 0) {
      imageUpdates = {
        images: {
          create: files.map(file => ({
            url: `/uploads/${file.filename}`,
          })),
        },
      };
    }

    // Update the build with both data and images
    const updatedBuild = await prisma.build.update({
      where: { id },
      data: {
        ...processedData,
        ...imageUpdates,
      },
      include: {
        images: true,
      },
    });

    console.log('Successfully updated build:', updatedBuild);
    res.json(updatedBuild);
  } catch (error) {
    console.error('Error updating build:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Prisma error code:', (error as any).code);
      }
    }
    next(error);
  }
};

// Delete a build and its associated images
const deleteBuild: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // First get the build to check ownership and get image paths
    const build = await prisma.build.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        images: true,
      },
    });

    if (!build) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    // Delete the build and its images from the database
    await prisma.build.delete({
      where: {
        id,
      },
    });

    // Clean up image files from the filesystem
    build.images.forEach(image => {
      const filePath = path.join(process.cwd(), 'public', image.url);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file ${filePath}:`, err);
      });
    });

    res.json({ message: 'Build deleted successfully' });
  } catch (error) {
    console.error('Error deleting build:', error);
    next(error);
  }
};

// Delete an image from a build
const deleteImage: AuthenticatedRequestHandler = async (req, res, next) => {
  try {
    const { buildId, imageId } = req.params;
    const userId = req.userId;

    // First check if the build exists and belongs to the user
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId,
      },
      include: {
        images: true,
      },
    });

    if (!build) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    // Find the image to delete
    const imageToDelete = build.images.find(img => img.id === imageId);
    if (!imageToDelete) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Don't allow deleting the last image
    if (build.images.length === 1) {
      res.status(400).json({ error: 'Cannot delete the last image. A build must have at least one image.' });
      return;
    }

    // Delete the image from the database
    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });

    // Delete the image file from the filesystem
    const filePath = path.join(process.cwd(), 'public', imageToDelete.url);
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filePath}:`, err);
    });

    // Return the updated build with remaining images
    const updatedBuild = await prisma.build.findUnique({
      where: {
        id: buildId,
      },
      include: {
        images: true,
      },
    });

    res.json(updatedBuild);
  } catch (error) {
    console.error('Error deleting image:', error);
    next(error);
  }
};

// Get all public builds
const getPublicBuilds: RequestHandler = async (req, res, next) => {
  try {
    const builds = await prisma.build.findMany({
      include: {
        images: true,
        user: {
          select: {
            username: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(builds);
  } catch (error) {
    console.error('Error fetching public builds:', error);
    next(error);
  }
};

// Public routes (no auth required)
router.get('/public', getPublicBuilds as RequestHandler);

// Apply middleware to protected routes
router.use(authenticateToken);

// Protected routes
router.route('/')
  .get(getAllBuilds as RequestHandler)
  .post(upload.array('images'), createBuild as RequestHandler);

router.route('/:id')
  .get(getBuild as RequestHandler)
  .put(upload.array('images'), updateBuild as RequestHandler)
  .delete(deleteBuild as RequestHandler);

// Add route for deleting individual images
router.delete('/:buildId/images/:imageId', deleteImage as RequestHandler);

export default router; 