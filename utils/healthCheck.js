/**
 * Health check utility
 */
const mongoose = require('mongoose');

const healthCheck = async () => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    memory: process.memoryUsage()
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      checks.database = 'connected';
    } else {
      checks.database = 'disconnected';
      checks.status = 'degraded';
    }
  } catch (error) {
    checks.database = 'error';
    checks.status = 'error';
    checks.error = error.message;
  }

  return checks;
};

module.exports = healthCheck;

