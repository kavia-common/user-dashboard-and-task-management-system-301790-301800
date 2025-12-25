const Task = require('../models/Task');

class TasksController {
  // PUBLIC_INTERFACE
  /**
   * Get all tasks for authenticated user with optional filtering and search
   * Supports query parameters: status, priority, search (searches in title/description)
   * @param {Object} req - Express request object with query parameters
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with array of tasks
   */
  async getTasks(req, res) {
    try {
      const { status, priority, search } = req.query;
      const query = { userId: req.user._id };

      // Apply filters
      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      // Apply search
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a single task by ID for authenticated user
   * @param {Object} req - Express request object with task ID in params
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with task data
   */
  async getTaskById(req, res) {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new task for authenticated user
   * @param {Object} req - Express request object with task data in body
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created task
   */
  async createTask(req, res) {
    try {
      const { title, description, status, priority, dueDate } = req.body;

      const task = new Task({
        title,
        description,
        status,
        priority,
        dueDate,
        userId: req.user._id
      });

      await task.save();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      console.error('Create task error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update a task by ID for authenticated user
   * @param {Object} req - Express request object with task ID in params and update data in body
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated task
   */
  async updateTask(req, res) {
    try {
      const { title, description, status, priority, dueDate } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate;

      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      console.error('Update task error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a task by ID for authenticated user
   * @param {Object} req - Express request object with task ID in params
   * @param {Object} res - Express response object
   * @returns {Object} JSON response confirming deletion
   */
  async deleteTask(req, res) {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting task'
      });
    }
  }
}

module.exports = new TasksController();
