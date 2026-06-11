const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { sanitizeUser } = require('../utils/user');

exports.getDashboard = asyncHandler(async (req, res) => {
  const supplierId = req.user.id;

  const myProducts = await prisma.product.findMany({
    where: { createdBy: supplierId },
    select: { id: true, name: true, stock_quantity: true },
  });

  const productNames = myProducts.map((p) => p.name);

  const [pendingOrders, recentOrders, lowStockProducts] = await Promise.all([
    productNames.length
      ? prisma.order.count({ where: { item: { in: productNames }, status: 'pending' } })
      : 0,
    productNames.length
      ? prisma.order.findMany({
        where: { item: { in: productNames } },
        take: 10,
        orderBy: { id: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      })
      : [],
    myProducts.filter((p) => p.stock_quantity <= 10),
  ]);

  res.json({
    productCount: myProducts.length,
    pendingOrders,
    lowStockProducts,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      user: sanitizeUser(o.user),
    })),
  });
});

exports.getMyProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { createdBy: req.user.id },
    include: { category: true, _count: { select: { reviews: true } } },
    orderBy: { id: 'desc' },
  });
  res.json(products);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: { createdBy: req.user.id },
    select: { name: true },
  });
  const names = products.map((p) => p.name);
  if (!names.length) return res.json([]);

  const status = req.query.status;
  const orders = await prisma.order.findMany({
    where: {
      item: { in: names },
      ...(status ? { status } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { id: 'desc' },
  });

  res.json(orders.map((o) => ({ ...o, user: sanitizeUser(o.user) })));
});

exports.getProductSales = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new AppError('Product not found', 404);
  if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const orders = await prisma.order.findMany({
    where: { item: product.name, status: { not: 'cancelled' } },
    select: { quantity: true, status: true, createdAt: true },
  });

  const totalSold = orders.reduce((sum, o) => sum + o.quantity, 0);
  const revenue = totalSold * product.price;

  res.json({
    productId: product.id,
    productName: product.name,
    totalOrders: orders.length,
    totalSold,
    estimatedRevenue: revenue,
    ordersByStatus: orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {}),
  });
});
