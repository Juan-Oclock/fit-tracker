// Simple test endpoint to verify serverless function is working
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log the request for debugging
  console.log(`API Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Simple test response
  if (req.url === '/api/debug/database') {
    res.status(200).json({
      status: 'success',
      message: 'Serverless function is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
    return;
  }
  
  // For now, return a simple response for all other endpoints
  res.status(200).json({
    status: 'success',
    message: 'API endpoint reached',
    method: req.method,
    url: req.url,
    note: 'Full server functionality coming soon'
  });
}
