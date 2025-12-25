const User = require('../models/User');

class ProfileController {
  // PUBLIC_INTERFACE
  /**
   * Get authenticated user's profile
   * @param {Object} req - Express request object with authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with user profile data
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update authenticated user's profile
   * @param {Object} req - Express request object with update data in body
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated user profile
   */
  async updateProfile(req, res) {
    try {
      const { name, bio, email } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (email !== undefined) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: req.user._id } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
        updateData.email = email;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete authenticated user's account
   * @param {Object} req - Express request object with authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response confirming deletion
   */
  async deleteProfile(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.user._id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      console.error('Delete profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting profile'
      });
    }
  }
}

module.exports = new ProfileController();
