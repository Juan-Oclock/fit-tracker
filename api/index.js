const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
const router = express.Router();
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'ok', message: 'API is working' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Function is working' });
});

// Catch-all route for testing
router.all('*', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Request received',
    path: req.path,
    method: req.method,
    headers: req.headers
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.use('/.netlify/functions/index', router);

// Export the handler for Netlify
module.exports.handler = serverless(app);
