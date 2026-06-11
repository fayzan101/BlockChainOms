const prisma = require('../config/prismaClient');
const asyncHandler = require('../middleware/asyncHandler');
const { isDemoMode } = require('../../services/blockchainService');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    userCount,
    productCount,
    orderCount,
    ordersByStatus,
    revenueAgg,
    lowStockCount,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.$queryRaw`
      SELECT COALESCE(SUM(p.price * o.quantity), 0)::float AS total
      FROM "Order" o
      JOIN "Product" p ON p.name = o.item
      WHERE o.status != 'cancelled'
    `,
    prisma.product.count({ where: { stock_quantity: { lte: 10 } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  res.json({
    users: userCount,
    products: productCount,
    orders: orderCount,
    ordersByStatus: ordersByStatus.reduce((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {}),
    estimatedRevenue: revenueAgg[0]?.total ?? 0,
    lowStockProducts: lowStockCount,
    blockchainDemoMode: isDemoMode(),
    recentOrders,
  });
});
