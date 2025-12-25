const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Register a new user
   * @param {Object} req - Express request object with email, password, name in body
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with user data and JWT token
   */
  async signup(req, res) {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.error('Signup failed: Database not connected');
        return res.status(503).json({
          success: false,
          message: 'Database service is currently unavailable. Please try again later.'
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user with explicit error handling
      let user;
      try {
        user = new User({
          email,
          password,
          name
        });

        await user.save();
      } catch (saveError) {
        console.error('User save error:', saveError.stack);
        
        // Handle duplicate key error (race condition)
        if (saveError.name === 'MongoServerError' && saveError.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
        
        // Handle validation errors
        if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(saveError.errors).map(err => err.message)
          });
        }
        
        // Re-throw other errors to outer catch
        throw saveError;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error.stack);
      
      // Handle MongoDB timeout errors
      if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
        return res.status(503).json({
          success: false,
          message: 'Database service is currently unavailable. Please try again later.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'An error occurred during signup. Please try again later.'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Login user with email and password
   * @param {Object} req - Express request object with email and password in body
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with user data and JWT token
   */
  async login(req, res) {
    try {
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.error('Login failed: Database not connected');
        return res.status(503).json({
          success: false,
          message: 'Database service is currently unavailable. Please try again later.'
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error.stack);
      
      // Handle MongoDB timeout errors
      if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
        return res.status(503).json({
          success: false,
          message: 'Database service is currently unavailable. Please try again later.'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'An error occurred during login. Please try again later.'
      });
    }
  }
}

module.exports = new AuthController();
