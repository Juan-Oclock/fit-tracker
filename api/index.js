import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { getStorage } from '../server/storage.js';
import { seedCategories } from '../server/seed-categories.js';
import { seedMuscleGroups } from '../server/seed-muscle-groups.js';

// Initialize storage and register routes
let app = null;
let initialized = false;

async function initializeApp() {
  if (!initialized) {
    try {
      const storage = await getStorage();
      await storage.ensureInitialized();
      await seedCategories();
      await seedMuscleGroups();
      console.log("Database initialized, categories and muscle groups seeded");
      initialized = true;
    } catch (error) {
      console.log(`Failed to initialize database: ${error}`);
    }
  }
  
  if (!app) {
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false }));

    // Debug middleware to log all PUT requests
    app.use((req, res, next) => {
      if (req.method === 'PUT') {
        console.log('🔧 PUT request received:', req.path);
        console.log('  - Full URL:', req.url);
        console.log('  - Headers:', req.headers);
      }
      next();
    });

    // Register routes
    await registerRoutes(app);

    // Error handler
    app.use((err, req, res, _next) => {
      if (res.headersSent) {
        return;
      }

      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.log(`ERROR: ${status} - ${message}`);
      console.log(err.stack);

      res.status(status).json({ message });
    });
  }
  
  return app;
}

// Export the serverless function
export default async function handler(req, res) {
  const expressApp = await initializeApp();
  
  // Use the express app to handle the request
  return expressApp(req, res);
}
