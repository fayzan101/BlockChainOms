const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { recordStockMovement } = require('../../services/inventoryService');
const { notifyLowStock } = require('../../services/notificationService');

const LOW_STOCK_THRESHOLD = 10;

async function assertProductAccess(user, product) {
  if (user.role === 'admin') return;
  if (user.role === 'supplier' && product.createdBy === user.id) return;
  throw new AppError('Forbidden', 403);
}

exports.getStockMovements = asyncHandler(async (req, res) => {
  const productId = req.query.productId ? parseInt(req.query.productId, 10) : undefined;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  let productFilter = {};
  if (productId) {
    productFilter = { productId };
  } else if (req.user.role === 'supplier') {
    productFilter = { product: { createdBy: req.user.id } };
  }

  const movements = await prisma.stockMovement.findMany({
    where: productFilter,
    include: {
      product: { select: { id: true, name: true, stock_quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json(movements);
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const { productId, change, note } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  await assertProductAccess(req.user, product);

  if (change < 0 && product.stock_quantity + change < 0) {
    throw new AppError('Insufficient stock for adjustment', 400);
  }

  const movement = await prisma.$transaction(async (tx) => {
    const result = await recordStockMovement(tx, {
      productId,
      change,
      reason: 'manual_adjustment',
      performedBy: req.user.id,
      note,
    });

    const updated = await tx.product.findUnique({ where: { id: productId } });
    if (updated.stock_quantity <= LOW_STOCK_THRESHOLD) {
      await notifyLowStock(product.createdBy, updated, tx);
    }
    return result;
  });

  const updatedProduct = await prisma.product.findUnique({ where: { id: productId } });
  res.json({ movement, product: updatedProduct });
});

exports.getInventorySummary = asyncHandler(async (req, res) => {
  const where = req.user.role === 'supplier' ? { createdBy: req.user.id } : {};

  const [totalProducts, lowStock, outOfStock, totalUnits] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({ where: { ...where, stock_quantity: { lte: LOW_STOCK_THRESHOLD, gt: 0 } } }),
    prisma.product.count({ where: { ...where, stock_quantity: 0 } }),
    prisma.product.aggregate({ where, _sum: { stock_quantity: true } }),
  ]);

  res.json({
    totalProducts,
    lowStock,
    outOfStock,
    totalUnits: totalUnits._sum.stock_quantity || 0,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  });
});
