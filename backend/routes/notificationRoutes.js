const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

router.use(authMiddleware);

router.get('/unread-count', notificationController.getUnreadCount);
router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(idParamSchema, 'params'), notificationController.markAsRead);
router.delete('/:id', validate(idParamSchema, 'params'), notificationController.deleteNotification);

module.exports = router;
