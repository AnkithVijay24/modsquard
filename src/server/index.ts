import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth';
import uploadRoutes from './api/routes/upload';
import adminRoutes from './api/routes/admin';
import carRoutes from './api/routes/cars';
import buildsRoutes from './api/routes/builds';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5001; // Force port 5001

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === 'http://localhost:3000' || origin === 'http://localhost:3001')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Body parser middleware
app.use(express.json());

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/builds', buildsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
} 