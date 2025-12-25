const mongoose = require('mongoose');

// PUBLIC_INTERFACE
/**
 * Establishes connection to MongoDB database
 * @returns {Promise<mongoose.Connection>} MongoDB connection instance
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
