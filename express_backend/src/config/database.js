const mongoose = require('mongoose');

// PUBLIC_INTERFACE
/**
 * Check if MongoDB is connected and ready
 * @returns {boolean} True if connected (readyState === 1)
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// PUBLIC_INTERFACE
/**
 * Get current connection state with description
 * @returns {Object} Connection state info
 */
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    readyState: mongoose.connection.readyState,
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'N/A'
  };
};

// PUBLIC_INTERFACE
/**
 * Establishes connection to MongoDB database
 * Uses Atlas URI with DNS SRV resolution and handles connection errors gracefully
 * @returns {Promise<mongoose.Connection>} MongoDB connection instance
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    console.log('Attempting to connect to MongoDB Atlas...');

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Ready state: ${conn.connection.readyState}`);
    
    // Set up connection event listeners for better monitoring
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Detailed error analysis
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.error('\n' + '='.repeat(60));
      console.error('⚠️  MONGODB ATLAS IP WHITELIST ISSUE');
      console.error('='.repeat(60));
      console.error('This server\'s IP address is NOT whitelisted in MongoDB Atlas.');
      console.error('\n📋 ACTION REQUIRED:');
      console.error('   1. Go to MongoDB Atlas: https://cloud.mongodb.com');
      console.error('   2. Navigate to: Network Access → IP Access List');
      console.error('   3. Click "Add IP Address"');
      console.error('   4. Option A (Development): Add 0.0.0.0/0 to allow all IPs');
      console.error('   5. Option B (Production): Add this server\'s specific IP');
      console.error('\n💡 Note: The server will continue running but all database');
      console.error('   operations will return 503 Service Unavailable.');
      console.error('='.repeat(60) + '\n');
    }
    
    if (error.message.includes('authentication') || error.message.includes('auth failed')) {
      console.error('\n⚠️  MongoDB Authentication Issue:');
      console.error('   Username or password in MONGO_URI is incorrect.');
      console.error('   Please verify credentials in MongoDB Atlas.\n');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n⚠️  DNS Resolution Error:');
      console.error('   Cannot resolve MongoDB Atlas hostname.');
      console.error('   Check internet connection and MONGO_URI format.\n');
    }
    
    // Log connection attempt details
    console.error('Connection attempt to:', mongoURI.substring(0, 30) + '...');
    console.error('Server will continue without database connection.');
    console.error('API endpoints requiring database will return 503 errors.\n');
    
    // Don't exit in development to allow server to run for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // Throw the error so the promise chain in server.js can handle it properly
    throw error;
  }
};

module.exports = connectDB;
module.exports.isConnected = isConnected;
module.exports.getConnectionState = getConnectionState;
