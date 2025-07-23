// Import required modules with proper error handling
let express, getStorage, registerRoutes, seedCategories, seedMuscleGroups;

try {
  express = (await import('express')).default;
  
  // Try to import server modules - if they fail, we'll use fallback routes
  try {
    const storageModule = await import('../server/storage.js');
    getStorage = storageModule.getStorage;
    
    const routesModule = await import('../server/routes.js');
    registerRoutes = routesModule.registerRoutes;
    
    const seedCategoriesModule = await import('../server/seed-categories.js');
    seedCategories = seedCategoriesModule.seedCategories;
    
    const seedMuscleGroupsModule = await import('../server/seed-muscle-groups.js');
    seedMuscleGroups = seedMuscleGroupsModule.seedMuscleGroups;
    
    console.log('✅ Successfully imported all server modules');
  } catch (importError) {
    console.warn('⚠️ Failed to import server modules:', importError.message);
    console.log('Will use fallback routes instead');
  }
} catch (error) {
  console.error('❌ Failed to import express:', error);
  throw error;
}

// Cache the Express app
let app = null;
let initialized = false;

async function initializeDatabase() {
  if (initialized || !getStorage) return;
  
  try {
    console.log('🔄 Initializing database...');
    const storage = await getStorage();
    await storage.ensureInitialized();
    
    if (seedCategories) {
      await seedCategories();
      console.log('✅ Categories seeded');
    }
    
    if (seedMuscleGroups) {
      await seedMuscleGroups();
      console.log('✅ Muscle groups seeded');
    }
    
    initialized = true;
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - continue with fallback routes
  }
}

async function createApp() {
  if (app) return app;
  
  app = express();
  
  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false }));
  
  // CORS middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });
  
  // Debug middleware
  app.use((req, res, next) => {
    console.log(`🚀 ${req.method} ${req.url}`);
    if (req.method === 'PUT') {
      console.log('🔧 PUT request details:', {
        path: req.path,
        url: req.url,
        headers: req.headers,
        body: req.body
      });
    }
    next();
  });
  
  // Initialize database
  await initializeDatabase();
  
  // Register full routes if available, otherwise use fallback
  if (registerRoutes) {
    try {
      console.log('🔄 Registering full server routes...');
      await registerRoutes(app);
      console.log('✅ Full server routes registered');
    } catch (error) {
      console.error('❌ Failed to register full routes:', error);
      console.log('Will use fallback routes instead');
      setupFallbackRoutes(app);
    }
  } else {
    console.log('⚠️ Using fallback routes (server modules not available)');
    setupFallbackRoutes(app);
  }
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    
    if (res.headersSent) {
      return next(err);
    }
    
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
  
  return app;
}

function setupFallbackRoutes(app) {
  // Auth route fallback
  app.get('/api/auth/user', (req, res) => {
    console.log('⚠️ Fallback auth/user route called');
    res.status(503).json({
      status: 'error',
      message: 'Authentication service temporarily unavailable',
      note: 'Server modules not loaded - check deployment'
    });
  });
  
  // Test routes
  app.get('/api/debug/database', (req, res) => {
    res.json({
      status: 'success',
      message: 'Serverless function working (fallback mode)',
      timestamp: new Date().toISOString(),
      serverless: true,
      fallbackMode: true
    });
  });
  
  app.get('/api/exercises', (req, res) => {
    res.json({
      status: 'success',
      message: 'Exercises endpoint (fallback mode)',
      data: [],
      note: 'Database not available - using fallback'
    });
  });
  
  // Test PUT endpoint for monthly goals
  app.put('/api/goals/monthly', (req, res) => {
    console.log('✅ PUT /api/goals/monthly reached (fallback mode)');
    console.log('Request body:', req.body);
    
    res.json({
      status: 'success',
      message: 'PUT /api/goals/monthly endpoint working (fallback mode)!',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  });
  
  // Catch-all for other API routes
  app.all('/api/*', (req, res) => {
    res.json({
      status: 'success',
      message: `${req.method} ${req.url} endpoint reached (fallback mode)`,
      note: 'Endpoint exists but full functionality not available'
    });
  });
}

// Serverless function handler
export default async function handler(req, res) {
  try {
    const expressApp = await createApp();
    
    // Use Express to handle the request
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Serverless function initialization failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
