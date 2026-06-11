const crypto = require('crypto');

/**
 * Canonical order hash used for create, update, and verification.
 * Always pass a Prisma order row (item + quantity + status + updatedAt).
 */
function generateOrderHash(order) {
  const id = order.id;
  const userId = order.userId;
  const item = order.item;
  const quantity = order.quantity;
  const status = order.status || 'pending';
  const timestamp = order.updatedAt instanceof Date
    ? order.updatedAt.toISOString()
    : String(order.updatedAt);

  const itemsString = `${item}:${quantity}`;
  const hashString = `${id}|${userId}|${itemsString}|${quantity}|${status}|${timestamp}`;
  return crypto.createHash('sha256').update(hashString).digest('hex');
}

module.exports = { generateOrderHash };
