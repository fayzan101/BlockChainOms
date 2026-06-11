const prisma = require('../backend/config/prismaClient');

async function createNotification({ userId, type, title, message, metadata }, tx = prisma) {
  return tx.notification.create({
    data: { userId, type, title, message, metadata: metadata || undefined },
  });
}

async function notifyOrderCreated(order, tx = prisma) {
  return createNotification({
    userId: order.userId,
    type: 'order_created',
    title: 'Order placed',
    message: `Your order #${order.id} for ${order.quantity}x ${order.item} has been placed.`,
    metadata: { orderId: order.id, status: order.status },
  }, tx);
}

async function notifyOrderStatusChange(order, oldStatus, newStatus, tx = prisma) {
  return createNotification({
    userId: order.userId,
    type: 'order_status',
    title: 'Order status updated',
    message: `Order #${order.id} changed from ${oldStatus} to ${newStatus}.`,
    metadata: { orderId: order.id, oldStatus, newStatus },
  }, tx);
}

async function notifyLowStock(supplierId, product, tx = prisma) {
  return createNotification({
    userId: supplierId,
    type: 'low_stock',
    title: 'Low stock alert',
    message: `${product.name} is down to ${product.stock_quantity} units.`,
    metadata: { productId: product.id, stock: product.stock_quantity },
  }, tx);
}

module.exports = {
  createNotification,
  notifyOrderCreated,
  notifyOrderStatusChange,
  notifyLowStock,
};
