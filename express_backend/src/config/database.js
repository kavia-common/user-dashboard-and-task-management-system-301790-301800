const mongoose = require('mongoose');

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
    console.error('Full error stack:', error.stack);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('⚠️  MongoDB Atlas Connection Issue:');
      console.error('   The server IP address may not be whitelisted in MongoDB Atlas.');
      console.error('   Please add 0.0.0.0/0 to the IP Access List in MongoDB Atlas');
      console.error('   or add the specific server IP address.');
    }
    
    if (error.message.includes('authentication')) {
      console.error('⚠️  MongoDB Authentication Issue:');
      console.error('   Please verify the username and password in MONGO_URI are correct.');
    }
    
    console.error('   Server will continue without database connection.');
    console.error('   API endpoints requiring database will fail until connection is established.');
    
    // Don't exit in development to allow server to run for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // Throw the error so the promise chain in server.js can handle it properly
    throw error;
  }
};

module.exports = connectDB;
