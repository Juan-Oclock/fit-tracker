import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.use(express.json());

const router = express.Router();
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'ok', message: 'API is working' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Function is working' });
});

router.all('*', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Request received',
    path: req.path,
    method: req.method,
    headers: req.headers,
  });
});

app.use(router);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default serverless(app);
