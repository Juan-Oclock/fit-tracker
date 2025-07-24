import express from 'express';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Dynamically import the modules
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Initialize database connection
let dbInitialized = false;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      // Import using dynamic import to ensure paths are resolved correctly
      const { getStorage } = await import('../dist/server/storage.js');
      const storage = await getStorage();
      await storage.ensureInitialized();
      console.log('Database initialized successfully');
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return res.status(500).json({ error: 'Database initialization failed', details: error.message });
    }
  }
  next();
});

// Register all business logic routes
try {
  const { registerRoutes } = await import('../dist/server/routes.js');
  await registerRoutes(app);
} catch (error) {
  console.error('Error registering routes:', error);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message, stack: err.stack });
});

export default serverless(app);
