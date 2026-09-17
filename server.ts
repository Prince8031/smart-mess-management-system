import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/src/config/db';
import { seedDatabase } from './server/src/utils/seed';
import { createServer as createApiServer } from './server/src/server';

const PORT = 3000;

async function startServer() {
  console.log('Initializing Smart Mess Management System Full-Stack Server...');

  // 1. Initialize MongoDB connection and seed defaults
  try {
    await connectDB();
    await seedDatabase(false);
  } catch (err) {
    console.error('Database connection error:', err);
  }

  // 2. Initialize API Express Application
  const app = createApiServer();

  // 3. Mount Vite in development or serve static dist in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite dev server middleware on port 3000...');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`Serving production build from ${distPath}...`);
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 4. Start listening on 0.0.0.0:3000
  app.get('/', (_req, res) => {
    res.status(200).json({success:true, message: 'Smart Mess Management System API is running!'});
  });
    
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Smart Mess Management System running on http://0.0.0.0:${PORT}`);
  });
}


startServer().catch((err) => {
  console.error('Fatal failure starting server:', err);
  process.exit(1);
});
