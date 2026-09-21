import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import { seedDatabase } from './utils/seed';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentRoutes';
import menuRoutes from './routes/menuRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import billRoutes from './routes/billRoutes';
import paymentRoutes from './routes/paymentRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import complaintRoutes from './routes/complaintRoutes';
import noticeRoutes from './routes/noticeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import settingsRoutes from './routes/settingsRoutes';

dotenv.config();

export const createServer = (): Express => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === clientUrl ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.includes('run.app') ||
          origin.includes('webcontainer')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Mess Management API is running',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/billing', billRoutes);
  app.use('/api/bills', billRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/notices', noticeRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/settings', settingsRoutes);

  app.use(errorHandler);

  return app;
};

export const startStandaloneServer = async (port: number = 5000): Promise<void> => {
  await connectDB();
  await seedDatabase(false);

  const app = createServer();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Mess Management Backend running on http://0.0.0.0:${port}`);
  });
};

if (process.argv[1]?.endsWith('server/src/server.ts')) {
  const port = Number(process.env.PORT) || 5000;
  startStandaloneServer(port).catch((err) => {
    console.error('Fatal error starting backend server:', err);
    process.exit(1);
  });
}
