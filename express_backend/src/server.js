require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start server immediately, connect to MongoDB asynchronously
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation available at http://${HOST}:${PORT}/docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  
  // Connect to MongoDB (non-blocking, server already listening)
  connectDB().then(() => {
    console.log('✅ Database connection successful');
  }).catch((err) => {
    console.error('⚠️  Database connection failed, but server is running:', err.message);
    console.log('Server will continue to accept requests. Database operations may fail.');
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
