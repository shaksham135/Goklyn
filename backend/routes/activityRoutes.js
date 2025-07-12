const express = require('express');
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity logging and retrieval
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of activities to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (ISO format)
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/', activityController.getRecentActivities);

/**
 * @swagger
 * /api/activities/{entityType}/{entityId}:
 *   get:
 *     summary: Get activities for a specific entity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of the entity (e.g., 'user', 'project')
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: List of activities for the specified entity
 */
router.get('/:entityType/:entityId', activityController.getEntityActivities);

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get activities for a specific user
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID of the user (defaults to current user if not provided)
 *     responses:
 *       200:
 *         description: List of activities for the specified user
 */
router.get('/user', activityController.getUserActivities);
router.get('/user/:userId', activityController.getUserActivities);

/**
 * @swagger
 * /api/activities/cleanup:
 *   delete:
 *     summary: Clean up old activities (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Delete activities older than this many days
 *     responses:
 *       200:
 *         description: Success message with number of activities deleted
 */
router.delete('/cleanup', authorize('admin'), activityController.cleanupOldActivities);

module.exports = router;
