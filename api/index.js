import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the Express app
let app = null;
let initialized = false;

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
  
  // Test routes
  app.get('/api/debug/database', (req, res) => {
    res.json({
      status: 'success',
      message: 'Database debug endpoint working!',
      timestamp: new Date().toISOString(),
      serverless: true
    });
  });
  
  app.get('/api/exercises', (req, res) => {
    res.json({
      status: 'success',
      message: 'Exercises endpoint working!',
      data: [],
      note: 'Database integration coming next'
    });
  });
  
  // Test PUT endpoint for monthly goals
  app.put('/api/goals/monthly', (req, res) => {
    console.log('✅ PUT /api/goals/monthly reached successfully!');
    console.log('Request body:', req.body);
    
    res.json({
      status: 'success',
      message: 'PUT /api/goals/monthly endpoint working!',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  });
  
  // Catch-all for other API routes
  app.all('/api/*', (req, res) => {
    res.json({
      status: 'success',
      message: `${req.method} ${req.url} endpoint reached`,
      note: 'Endpoint exists but full functionality not yet implemented'
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    
    if (res.headersSent) {
      return next(err);
    }
    
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
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
