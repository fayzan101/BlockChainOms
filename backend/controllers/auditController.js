const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const orderId = req.query.orderId ? parseInt(req.query.orderId, 10) : undefined;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  const logs = await prisma.auditLog.findMany({
    where: orderId ? { order_id: orderId } : undefined,
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      Order: {
        select: { id: true, item: true, status: true, userId: true },
      },
    },
  });

  res.json(logs);
});

exports.getAuditLogById = asyncHandler(async (req, res) => {
  const log = await prisma.auditLog.findUnique({
    where: { id: req.params.id },
    include: {
      Order: {
        select: { id: true, item: true, status: true, userId: true },
      },
    },
  });

  if (!log) {
    throw new AppError('Audit log not found', 404);
  }

  res.json(log);
});
