const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { VALID_TRANSITIONS } = require('../validators/orderValidators');
const { generateOrderHash } = require('../utils/orderHash');
const { storeHashOnChain, getHashFromChain } = require('../../services/blockchainService');
const { decrementStock, restoreStock } = require('../../services/inventoryService');
const {
  notifyOrderCreated,
  notifyOrderStatusChange,
  notifyLowStock,
} = require('../../services/notificationService');
const { sanitizeUser } = require('../utils/user');

const LOW_STOCK_THRESHOLD = 10;

function orderAccessFilter(user) {
  if (user.role === 'customer') {
    return { userId: user.id };
  }
  return {};
}

function canAccessOrder(user, order) {
  if (user.role === 'customer') {
    return order.userId === user.id;
  }
  return true;
}

function formatOrder(order) {
  if (!order) return order;
  return {
    ...order,
    user: order.user ? sanitizeUser(order.user) : undefined,
  };
}

async function restoreOrderStock(tx, order, performedBy) {
  const product = await tx.product.findUnique({ where: { name: order.item } });
  if (!product) return null;

  await restoreStock(tx, {
    productId: product.id,
    quantity: order.quantity,
    reason: 'order_cancelled',
    referenceId: order.id,
    performedBy,
  });

  return product;
}

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: orderAccessFilter(req.user),
    include: { user: true },
    orderBy: { id: 'desc' },
  });
  res.json(orders.map(formatOrder));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { id: 'desc' },
  });
  res.json(orders);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { user: true },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (!canAccessOrder(req.user, order)) throw new AppError('Forbidden', 403);

  res.json(formatOrder(order));
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { item, quantity } = req.body;
  const userId = req.user.role === 'admin' && req.body.userId
    ? req.body.userId
    : req.user.id;

  let order;
  let product;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const found = await tx.product.findUnique({ where: { name: item } });
      if (!found) throw new AppError('Product not found', 404);
      if (found.stock_quantity < quantity) throw new AppError('Insufficient stock', 400);

      const created = await tx.order.create({
        data: { item, quantity, userId },
      });

      await decrementStock(tx, {
        productId: found.id,
        quantity,
        reason: 'order_created',
        referenceId: created.id,
        performedBy: req.user.id,
      });

      const updatedProduct = await tx.product.findUnique({ where: { id: found.id } });
      return { order: created, product: updatedProduct };
    });
    order = result.order;
    product = result.product;
  } catch (err) {
    if (err.isOperational) throw err;
    if (err.statusCode) throw new AppError(err.message, err.statusCode);
    throw err;
  }

  const hash = generateOrderHash(order);
  await storeHashOnChain(order.id, hash);
  await notifyOrderCreated(order);

  if (product.stock_quantity <= LOW_STOCK_THRESHOLD) {
    await notifyLowStock(product.createdBy, product);
  }

  res.status(201).json(order);
});

exports.updateOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { item, quantity, status } = req.body;
  const userRole = req.user.role;

  const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!oldOrder) throw new AppError('Order not found', 404);
  if (!canAccessOrder(req.user, oldOrder)) throw new AppError('Forbidden', 403);

  if (userRole === 'customer') {
    if (status && status !== oldOrder.status) {
      const canCancel = status === 'cancelled' && oldOrder.status === 'pending';
      if (!canCancel) {
        throw new AppError('Customers can only cancel pending orders', 403);
      }
    }
    if (item || quantity) {
      throw new AppError('Customers cannot change order items or quantity', 403);
    }
  }

  if (userRole === 'supplier') {
    if (item || quantity || req.body.userId) {
      throw new AppError('Suppliers cannot change order items, quantity, or owner', 403);
    }
    if (!status) throw new AppError('Suppliers can only update order status', 400);
  }

  if (status && oldOrder.status !== status) {
    const allowed = VALID_TRANSITIONS[oldOrder.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(`Invalid status transition from ${oldOrder.status} to ${status}`, 400);
    }
  }

  const updateData = {};
  if (userRole === 'admin') {
    if (item !== undefined) updateData.item = item;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (req.body.userId !== undefined) updateData.userId = req.body.userId;
  }
  if (status !== undefined) updateData.status = status;

  const oldHash = generateOrderHash(oldOrder);
  const isCancelling = status === 'cancelled' && oldOrder.status !== 'cancelled';

  const order = await prisma.$transaction(async (tx) => {
    if (isCancelling) {
      await restoreOrderStock(tx, oldOrder, req.user.id);
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: updateData,
    });

    await tx.auditLog.create({
      data: {
        order_id: updated.id,
        action: isCancelling ? 'CANCEL' : 'UPDATE',
        performed_by: req.user.id,
        old_hash: oldHash,
        new_hash: generateOrderHash(updated),
        timestamp: updated.updatedAt,
      },
    });

    return updated;
  });

  const newHash = generateOrderHash(order);
  const blockchainTxId = await storeHashOnChain(order.id, newHash);

  if (blockchainTxId) {
    await prisma.auditLog.updateMany({
      where: { order_id: order.id, blockchain_tx_id: null },
      data: { blockchain_tx_id: blockchainTxId },
    });
  }

  if (status && status !== oldOrder.status) {
    await notifyOrderStatusChange(order, oldOrder.status, status);
  }

  res.json(order);
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', 404);

  await prisma.$transaction(async (tx) => {
    if (order.status !== 'cancelled') {
      await restoreOrderStock(tx, order, req.user.id);
    }
    await tx.auditLog.deleteMany({ where: { order_id: orderId } });
    await tx.order.delete({ where: { id: orderId } });
  });

  res.json({ message: 'Order deleted' });
});

exports.verifyOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError('Order not found', 404);
  if (!canAccessOrder(req.user, order)) throw new AppError('Forbidden', 403);

  const dbHash = generateOrderHash(order);
  const blockchainHash = await getHashFromChain(orderId);

  res.json({
    orderId,
    dbHash,
    blockchainHash,
    verified: dbHash === blockchainHash,
  });
});
