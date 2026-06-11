const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.getNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json(notifications);
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ count });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });
  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== req.user.id) throw new AppError('Forbidden', 403);

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(updated);
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ message: 'All notifications marked as read', count: result.count });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });
  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== req.user.id) throw new AppError('Forbidden', 403);

  await prisma.notification.delete({ where: { id: req.params.id } });
  res.json({ message: 'Notification deleted' });
});
