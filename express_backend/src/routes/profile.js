const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profile');
const { authenticate, validate } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: User profile management endpoints (requires authentication)
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, profileController.getProfile.bind(profileController));

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 description: User's bio or description
 *                 example: Software developer
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or email already in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/',
  authenticate,
  [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty')
  ],
  validate,
  profileController.updateProfile.bind(profileController)
);

/**
 * @swagger
 * /profile:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete authenticated user's account
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/', authenticate, profileController.deleteProfile.bind(profileController));

module.exports = router;
