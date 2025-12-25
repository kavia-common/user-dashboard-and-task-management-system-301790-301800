require('dotenv').config();

// CRITICAL: Validate JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
  console.error('⚠️  CRITICAL: JWT_SECRET environment variable is not set!');
  console.error('   Authentication will fail without this secret.');
  console.error('   Please set JWT_SECRET in your .env file.');
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start server immediately, connect to MongoDB asynchronously
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation available at http://${HOST}:${PORT}/docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  console.log(`CORS Origin: ${corsOrigin}`);
  console.log('✅ JWT_SECRET is configured');
  
  // Connect to MongoDB (non-blocking, server already listening)
  connectDB()
    .then(() => {
      console.log('✅ Database connection established successfully');
    })
    .catch((err) => {
      console.error('⚠️  Database connection failed, but server is running');
      console.error('   Database operations will return 503 Service Unavailable');
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
