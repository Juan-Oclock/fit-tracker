import express from 'express';

// Storage will be loaded inside createApp function
// Updated: 2025-07-23T15:45:00 - Force fresh deployment
let getStorage = null;

// Simple authentication middleware
function isAuthenticated(req, res, next) {
  console.log('🔐 Auth middleware called for:', req.method, req.path);
  
  const authHeader = req.headers.authorization;
  console.log('  - Auth header present:', !!authHeader);
  console.log('  - Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('  - No valid auth header, returning 401');
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  console.log('  - Token length:', token?.length);
  
  try {
    // Extract user info from JWT token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('  - Token payload sub:', payload.sub);
    console.log('  - Token payload email:', payload.email);
    
    if (!payload.sub) {
      console.log('  - No sub in payload, returning 401');
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Add user info to request object
    req.user = {
      id: payload.sub,
      email: payload.email,
      user_metadata: payload.user_metadata || {}
    };
    
    console.log('  - Auth successful, user ID:', payload.sub);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Cache the Express app
let app = null;
let initialized = false;

// Essential routes setup
function setupEssentialRoutes(app) {
  // Auth route - essential for login flow
  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    console.log('✅ Auth user endpoint called for user:', req.user.id);
    
    // Return user info from JWT token
    const user = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.user_metadata?.first_name || null,
      lastName: req.user.user_metadata?.last_name || null,
      profileImageUrl: req.user.user_metadata?.avatar_url || null,
      weeklyGoal: 3, // Default goal
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('  - Returning user data:', user);
    res.json(user);
  });
  
  // Goal management routes
  app.put('/api/user/goal', isAuthenticated, (req, res) => {
    console.log('✅ User goal update for user:', req.user.id);
    console.log('  - Request body:', req.body);
    
    // For now, just return success with the updated goal
    const updatedUser = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.user_metadata?.first_name || null,
      lastName: req.user.user_metadata?.last_name || null,
      profileImageUrl: req.user.user_metadata?.avatar_url || null,
      weeklyGoal: req.body.weeklyGoal || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json(updatedUser);
  });
  
  // Monthly goal data endpoint
  app.get('/api/goals/monthly', isAuthenticated, (req, res) => {
    console.log('✅ Monthly goal data endpoint called for user:', req.user.id);
    console.log('  - Query params:', req.query);
    
    const { month, year } = req.query;
    
    // Return basic monthly goal structure
    const monthlyGoalData = {
      month: parseInt(month) || new Date().getMonth() + 1,
      year: parseInt(year) || new Date().getFullYear(),
      targetWorkouts: 12, // Default target
      completedWorkouts: 0,
      workoutDates: [],
      beforePhoto: null,
      progressPhotos: []
    };
    
    console.log('  - Returning monthly goal data:', monthlyGoalData);
    res.json(monthlyGoalData);
  });
  
  // Workouts endpoint - essential for goal card and other components
  app.get('/api/workouts', isAuthenticated, (req, res) => {
    console.log('✅ Workouts endpoint called for user:', req.user.id);
    
    // Return empty array for now - this prevents filter errors
    const workouts = [];
    
    console.log('  - Returning workouts array:', workouts.length, 'items');
    res.json(workouts);
  });
  
  // Debug endpoint to check storage status
  app.get('/api/debug/storage', async (req, res) => {
    console.log('🔍 Debug storage endpoint called');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT_SET',
        CWD: process.cwd(),
        NODE_VERSION: process.version
      },
      storage: {
        getStorageAvailable: !!getStorage,
        getStorageType: typeof getStorage
      }
    };
    
    if (getStorage) {
      try {
        console.log('  - Testing getStorage() call...');
        const storage = await getStorage();
        debugInfo.storage.storageInstanceType = storage.constructor.name;
        debugInfo.storage.storageTestSuccess = true;
        
        console.log('  - Testing getExercises() call...');
        const exercises = await storage.getExercises();
        debugInfo.storage.exerciseCount = exercises?.length || 0;
        debugInfo.storage.exerciseTestSuccess = true;
        
        if (exercises && exercises.length > 0) {
          debugInfo.storage.firstExercise = {
            id: exercises[0].id,
            name: exercises[0].name,
            category: exercises[0].category
          };
        }
      } catch (error) {
        debugInfo.storage.error = {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack
        };
      }
    }
    
    console.log('  - Debug info:', JSON.stringify(debugInfo, null, 2));
    res.json(debugInfo);
  });
  
  // Database connection test endpoint
  app.get('/api/debug/database', async (req, res) => {
    console.log('🔍 Database connection test endpoint called');
    
    const testInfo = {
      timestamp: new Date().toISOString(),
      databaseUrl: {
        exists: !!process.env.DATABASE_URL,
        prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT_SET',
        isPostgres: process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
      }
    };
    
    if (process.env.DATABASE_URL) {
      try {
        // Try to import and test the database connection directly
        console.log('  - Testing direct database connection...');
        const { drizzle } = await import('drizzle-orm/neon-serverless');
        const { neon } = await import('@neondatabase/serverless');
        
        const sql = neon(process.env.DATABASE_URL);
        const db = drizzle(sql);
        
        // Test query
        console.log('  - Executing test query...');
        const result = await sql`SELECT 1 as test`;
        
        testInfo.connectionTest = {
          success: true,
          result: result,
          message: 'Database connection successful'
        };
        
        console.log('  - Database connection test successful');
      } catch (error) {
        testInfo.connectionTest = {
          success: false,
          error: {
            type: error.constructor.name,
            message: error.message,
            stack: error.stack
          }
        };
        console.log('  - Database connection test failed:', error.message);
      }
    } else {
      testInfo.connectionTest = {
        success: false,
        message: 'DATABASE_URL not configured'
      };
    }
    
    console.log('  - Test info:', JSON.stringify(testInfo, null, 2));
    res.json(testInfo);
  });
  
  // New debug endpoint with different name to bypass caching
  app.get('/api/debug/status', async (req, res) => {
    console.log('🔍 Status debug endpoint called - bypassing cache');
    
    const statusInfo = {
      timestamp: new Date().toISOString(),
      version: '2025-07-23-v3-neon-fix',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 25) + '...' : 'NOT_SET',
        CWD: process.cwd(),
        NODE_VERSION: process.version
      },
      storage: {
        getStorageAvailable: !!getStorage,
        getStorageType: typeof getStorage
      }
    };
    
    if (getStorage) {
      try {
        console.log('  - Testing getStorage() call...');
        const storage = await getStorage();
        statusInfo.storage.storageInstanceType = storage.constructor.name;
        statusInfo.storage.storageTestSuccess = true;
        
        console.log('  - Testing getExercises() call...');
        const exercises = await storage.getExercises();
        statusInfo.storage.exerciseCount = exercises?.length || 0;
        statusInfo.storage.exerciseTestSuccess = true;
        
        if (exercises && exercises.length > 0) {
          statusInfo.storage.firstExercise = {
            id: exercises[0].id,
            name: exercises[0].name,
            category: exercises[0].category
          };
        }
        
        // Test database connection directly
        if (storage.constructor.name === 'InMemoryStorage') {
          statusInfo.storage.usingFallback = true;
          statusInfo.storage.reason = 'Database connection failed, using in-memory storage';
        } else {
          statusInfo.storage.usingFallback = false;
          statusInfo.storage.reason = 'Connected to database successfully';
        }
        
      } catch (error) {
        statusInfo.storage.error = {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack
        };
      }
    }
    
    console.log('  - Status info:', JSON.stringify(statusInfo, null, 2));
    res.json(statusInfo);
  });
  
  // Workouts with exercises endpoint - essential for dashboard
  app.get('/api/workouts-with-exercises', isAuthenticated, (req, res) => {
    console.log('✅ Workouts with exercises endpoint called for user:', req.user.id);
    
    // Return empty array for now - this prevents the slice error
    // In a full implementation, this would fetch from database
    const workouts = [];
    
    console.log('  - Returning workouts array:', workouts.length, 'items');
    res.json(workouts);
  });
  
  // Exercises endpoint
  app.get('/api/exercises', isAuthenticated, async (req, res) => {
    console.log('🏋️ Exercises endpoint called for user:', req.user.id);
    console.log('  - Request timestamp:', new Date().toISOString());
    console.log('  - Environment NODE_ENV:', process.env.NODE_ENV);
    console.log('  - getStorage function available:', !!getStorage);
    
    try {
      if (getStorage) {
        console.log('  - Calling getStorage()...');
        const storage = await getStorage();
        console.log('  - Storage instance type:', storage.constructor.name);
        
        console.log('  - Calling storage.getExercises()...');
        const exercises = await storage.getExercises();
        console.log('  - Raw exercises result type:', typeof exercises);
        console.log('  - Raw exercises is array:', Array.isArray(exercises));
        console.log('  - Successfully fetched', exercises?.length || 0, 'exercises from database');
        
        if (exercises && exercises.length > 0) {
          console.log('  - First exercise:', JSON.stringify(exercises[0], null, 2));
        } else {
          console.log('  - No exercises found in database');
        }
        
        res.json(exercises || []);
      } else {
        console.log('  - ❌ getStorage function not available, returning empty array');
        console.log('  - This indicates the storage module failed to load');
        res.json([]);
      }
    } catch (error) {
      console.error('  - ❌ Error fetching exercises:');
      console.error('    - Error type:', error.constructor.name);
      console.error('    - Error message:', error.message);
      console.error('    - Error stack:', error.stack);
      console.log('  - Falling back to empty array');
      res.json([]);
    }
  });
  
  // Categories endpoint
  app.get('/api/categories', isAuthenticated, async (req, res) => {
    console.log('✅ Categories endpoint called for user:', req.user.id);
    
    try {
      if (getStorage) {
        console.log('  - Fetching categories from database...');
        const storage = await getStorage();
        const categories = await storage.getCategories();
        console.log('  - Successfully fetched', categories.length, 'categories from database');
        res.json(categories);
      } else {
        console.log('  - Database not available, returning fallback categories');
        const fallbackCategories = [
          { id: 1, name: 'Strength', iconColor: '#FFD300' },
          { id: 2, name: 'Cardio', iconColor: '#FF6B6B' },
          { id: 3, name: 'Flexibility', iconColor: '#4ECDC4' }
        ];
        res.json(fallbackCategories);
      }
    } catch (error) {
      console.error('  - Error fetching categories:', error);
      console.log('  - Falling back to default categories');
      const fallbackCategories = [
        { id: 1, name: 'Strength', iconColor: '#FFD300' },
        { id: 2, name: 'Cardio', iconColor: '#FF6B6B' },
        { id: 3, name: 'Flexibility', iconColor: '#4ECDC4' }
      ];
      res.json(fallbackCategories);
    }
  });
  
  // Workout stats endpoint - essential for dashboard stats cards
  app.get('/api/stats/workouts', isAuthenticated, (req, res) => {
    console.log('✅ Workout stats endpoint called for user:', req.user.id);
    
    // Return basic stats structure
    const stats = {
      totalWorkouts: 0,
      thisWeek: 0,
      thisMonth: 0,
      weeklyGoal: 3,
      personalRecords: null,
      dailyQuote: {
        text: "Every workout is a step closer to your goals.",
        author: "Fit Tracker"
      }
    };
    
    console.log('  - Returning workout stats:', stats);
    res.json(stats);
  });
  
  // Muscle groups endpoint
  app.get('/api/muscle-groups', isAuthenticated, async (req, res) => {
    console.log('✅ Muscle groups endpoint called for user:', req.user.id);
    
    try {
      if (getStorage) {
        console.log('  - Fetching muscle groups from database...');
        const storage = await getStorage();
        const muscleGroups = await storage.getMuscleGroups();
        console.log('  - Successfully fetched', muscleGroups.length, 'muscle groups from database');
        res.json(muscleGroups);
      } else {
        console.log('  - Database not available, returning fallback muscle groups');
        const fallbackMuscleGroups = [
          { id: 1, name: 'Chest', color: '#FF6B6B' },
          { id: 2, name: 'Back', color: '#4ECDC4' },
          { id: 3, name: 'Legs', color: '#45B7D1' },
          { id: 4, name: 'Arms', color: '#96CEB4' },
          { id: 5, name: 'Shoulders', color: '#FFEAA7' },
          { id: 6, name: 'Core', color: '#DDA0DD' }
        ];
        res.json(fallbackMuscleGroups);
      }
    } catch (error) {
      console.error('  - Error fetching muscle groups:', error);
      console.log('  - Falling back to default muscle groups');
      const fallbackMuscleGroups = [
        { id: 1, name: 'Chest', color: '#FF6B6B' },
        { id: 2, name: 'Back', color: '#4ECDC4' },
        { id: 3, name: 'Legs', color: '#45B7D1' },
        { id: 4, name: 'Arms', color: '#96CEB4' },
        { id: 5, name: 'Shoulders', color: '#FFEAA7' },
        { id: 6, name: 'Core', color: '#DDA0DD' }
      ];
      res.json(fallbackMuscleGroups);
    }
  });
  
  // Quotes endpoints
  app.get('/api/quotes', isAuthenticated, async (req, res) => {
    console.log('✅ Quotes endpoint called for user:', req.user.id);
    
    try {
      if (getStorage) {
        console.log('  - Fetching quotes from database...');
        const storage = await getStorage();
        const quotes = await storage.getQuotes();
        console.log('  - Successfully fetched', quotes.length, 'quotes from database');
        res.json(quotes);
      } else {
        console.log('  - Database not available, returning empty quotes array');
        res.json([]);
      }
    } catch (error) {
      console.error('  - Error fetching quotes:', error);
      res.json([]);
    }
  });
  
  app.get('/api/quotes/daily', isAuthenticated, async (req, res) => {
    console.log('✅ Daily quote endpoint called for user:', req.user.id);
    
    try {
      if (getStorage) {
        console.log('  - Fetching daily quote from database...');
        const storage = await getStorage();
        const quotes = await storage.getQuotes();
        
        if (quotes && quotes.length > 0) {
          // Get a "daily" quote by using date as seed for consistent daily quote
          const today = new Date().toISOString().split('T')[0];
          const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
          const dailyQuote = quotes[seed % quotes.length];
          console.log('  - Returning daily quote from database:', dailyQuote.text);
          res.json(dailyQuote);
        } else {
          // Fallback quote
          const fallbackQuote = {
            id: 1,
            text: "The only bad workout is the one that didn't happen.",
            author: "Unknown",
            date: new Date().toISOString().split('T')[0]
          };
          res.json(fallbackQuote);
        }
      } else {
        console.log('  - Database not available, returning fallback daily quote');
        const fallbackQuote = {
          id: 1,
          text: "The only bad workout is the one that didn't happen.",
          author: "Unknown",
          date: new Date().toISOString().split('T')[0]
        };
        res.json(fallbackQuote);
      }
    } catch (error) {
      console.error('  - Error fetching daily quote:', error);
      const fallbackQuote = {
        id: 1,
        text: "The only bad workout is the one that didn't happen.",
        author: "Unknown",
        date: new Date().toISOString().split('T')[0]
      };
      res.json(fallbackQuote);
    }
  });
  
  // Exercise stats endpoint
  app.get('/api/stats/exercises', isAuthenticated, (req, res) => {
    console.log('✅ Exercise stats endpoint called for user:', req.user.id);
    
    // Return basic exercise stats
    const exerciseStats = {
      totalExercises: 0,
      favoriteExercise: null,
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0
    };
    
    console.log('  - Returning exercise stats:', exerciseStats);
    res.json(exerciseStats);
  });
  
  console.log('✅ Essential authentication routes setup complete');
}

async function createApp() {
  if (app) return app;
  
  app = express();
  
  // Load storage module inside the function
  if (!getStorage) {
    console.log('📦 Attempting to load database storage module...');
    console.log('  - Current working directory:', process.cwd());
    console.log('  - Node.js version:', process.version);
    console.log('  - Environment:', process.env.NODE_ENV);

    try {
      console.log('  - Importing ../server/storage.js...');
      const storageModule = await import('../server/storage.js');
      console.log('  - Storage module imported successfully');
      console.log('  - Available exports:', Object.keys(storageModule));
      
      getStorage = storageModule.getStorage;
      console.log('  - getStorage function type:', typeof getStorage);
      console.log('✅ Database storage module loaded successfully');
    } catch (error) {
      console.log('❌ Database storage module failed to load:');
      console.log('  - Error type:', error.constructor.name);
      console.log('  - Error message:', error.message);
      console.log('  - Error stack:', error.stack);
      console.log('  - Will use fallback data for API responses');
      getStorage = null;
    }
  }
  
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
  
  // Setup essential authentication routes
  setupEssentialRoutes(app);
  
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
