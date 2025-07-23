import express from 'express';

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
  
  // Goal management route
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
  
  console.log('✅ Essential authentication routes setup complete');
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
  
  // Setup essential authentication routes
  setupEssentialRoutes(app);
  
  // Setup additional test routes
  setupFallbackRoutes(app);
  
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
