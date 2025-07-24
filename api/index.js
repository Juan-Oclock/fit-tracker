import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../dist/server/routes.js';

const app = express();
app.use(express.json());

// Register all business logic routes (await if needed)
await registerRoutes(app);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default serverless(app);
