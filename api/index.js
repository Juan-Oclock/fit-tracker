import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../dist/server/routes.js';
import { getStorage } from '../dist/server/storage.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Initialize database connection
let dbInitialized = false;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      const storage = await getStorage();
      await storage.ensureInitialized();
      console.log('Database initialized successfully');
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return res.status(500).json({ error: 'Database initialization failed' });
    }
  }
  next();
});

// Register all business logic routes
try {
  await registerRoutes(app);
} catch (error) {
  console.error('Error registering routes:', error);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default serverless(app);
