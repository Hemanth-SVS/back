// server.js — Deployment-ready backend (no frontend serving)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectDB = require('./config/db');
const validateEnv = require('./utils/envValidator');
const logger = require('./utils/logger');
const healthCheck = require('./utils/healthCheck');

// Routes
const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/registerRoutes');
const searchRoutes = require('./routes/searchRoutes');
const otpRoutes = require('./routes/otpRoutes');

// Error handler middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Validate environment variables (throws or logs if missing)
validateEnv();

// Connect to database
connectDB().catch(err => {
  logger.error('Database connection failed', err);
  // If DB is critical, exit so Render marks deploy unhealthy
  process.exit(1);
});

// Security headers
app.use(helmet());

// Configure CORS:
// - If FRONTEND_URL is set, restrict to it.
// - Otherwise, allow all origins (for development).
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Health check -----
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'ok' ? 200 : 503;
    return res.status(statusCode).json(health);
  } catch (err) {
    logger.error('Health check failed', err);
    return res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

// ----- API Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/otp', otpRoutes);

// Catch unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API health: /api/health`);
});

// Handle "port already in use" and other server errors
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    process.exit(1);
  }
  logger.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown on SIGINT / SIGTERM
const gracefulShutdown = () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    // If you have DB connection close logic, call it here:
    // mongoose.connection.close(false, () => { process.exit(0); });
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.warn('Forcing shutdown.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
