const express = require('express');
const healthController = require('../controllers/health');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const tasksRoutes = require('./tasks');
const dbStatusRoutes = require('./dbstatus');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     description: Check if the service is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Mount route modules
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/tasks', tasksRoutes);
router.use('/dbstatus', dbStatusRoutes);

module.exports = router;
