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

// Initialize database connection - with timeout handling
let dbInitialized = false;
let dbInitializationPromise = null;
let seedingInProgress = false;

app.use(async (req, res, next) => {
  // Skip DB initialization for non-data endpoints
  if (req.path.startsWith('/static/') || req.path.endsWith('.ico') || req.path.endsWith('.png')) {
    return next();
  }
  
  // Health check endpoint should return quickly
  if (req.path === '/api/health') {
    return res.status(200).json({ 
      status: 'ok', 
      initialized: dbInitialized,
      seeding: seedingInProgress
    });
  }
  
  if (!dbInitialized) {
    try {
      // Use existing initialization promise if one is in progress
      if (!dbInitializationPromise) {
        console.log('Starting database initialization');
        dbInitializationPromise = initializeDatabase();
      }
      
      // Set a timeout for database initialization
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database initialization timeout')), 8000);
      });
      
      // Race between initialization and timeout
      await Promise.race([dbInitializationPromise, timeoutPromise]);
      dbInitialized = true;
      console.log('Database initialized successfully');
      
      // Start seeding in the background if not already in progress
      if (!seedingInProgress) {
        seedInBackground();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Reset the promise if it failed
      dbInitializationPromise = null;
      return res.status(503).json({ 
        error: 'Service temporarily unavailable', 
        message: 'Database initialization in progress, please try again shortly',
        details: error.message 
      });
    }
  }
  next();
});

async function initializeDatabase() {
  // Import using dynamic import to ensure paths are resolved correctly
  const { getStorage } = await import('../dist/server/storage.js');
  const storage = await getStorage();
  
  // Just ensure tables exist, don't seed data yet
  await storage.ensureTablesExist();
  return true;
}

async function seedInBackground() {
  if (seedingInProgress) return;
  
  seedingInProgress = true;
  try {
    console.log('Starting background data seeding...');
    const { seedEssentialData } = await import('../dist/server/compiled-seed.js');
    await seedEssentialData();
    console.log('Background seeding completed');
  } catch (error) {
    console.error('Background seeding failed:', error);
  } finally {
    seedingInProgress = false;
  }
}

// Add this before registering routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    initialized: dbInitialized,
    seeding: seedingInProgress
  });
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
