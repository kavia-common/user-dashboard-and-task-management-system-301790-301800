const express = require('express');
const mongoose = require('mongoose');
const { getConnectionState } = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /dbstatus:
 *   get:
 *     summary: Database connection status
 *     description: Check MongoDB connection status and details
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection status
 */
router.get('/', (req, res) => {
  const state = getConnectionState();
  const isConnected = mongoose.connection.readyState === 1;
  
  const status = {
    connected: isConnected,
    readyState: state.readyState,
    state: state.state,
    host: state.host,
    database: state.database,
    message: isConnected 
      ? 'Database is connected and ready' 
      : 'Database is not connected. Check MongoDB Atlas IP whitelist.',
    timestamp: new Date().toISOString()
  };
  
  res.status(isConnected ? 200 : 503).json(status);
});

module.exports = router;
