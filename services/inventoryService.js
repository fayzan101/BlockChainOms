class InventoryError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

async function recordStockMovement(tx, { productId, change, reason, referenceId, performedBy, note }) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new InventoryError('Product not found', 404);
  }
  if (product.stock_quantity + change < 0) {
    throw new InventoryError('Insufficient stock', 400);
  }

  await tx.product.update({
    where: { id: productId },
    data: { stock_quantity: { increment: change } },
  });

  return tx.stockMovement.create({
    data: { productId, change, reason, referenceId, performedBy, note },
  });
}

async function decrementStock(tx, { productId, quantity, reason, referenceId, performedBy }) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new InventoryError('Product not found', 404);
  }
  if (product.stock_quantity < quantity) {
    throw new InventoryError('Insufficient stock', 400);
  }

  return recordStockMovement(tx, {
    productId,
    change: -quantity,
    reason,
    referenceId,
    performedBy,
  });
}

async function restoreStock(tx, { productId, quantity, reason, referenceId, performedBy }) {
  return recordStockMovement(tx, {
    productId,
    change: quantity,
    reason,
    referenceId,
    performedBy,
  });
}

module.exports = { recordStockMovement, decrementStock, restoreStock };
