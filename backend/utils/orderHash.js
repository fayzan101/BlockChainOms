const crypto = require('crypto');

/**
 * Generates a SHA-256 hash for an order
 * @param {Object} order - The order object
 * @returns {string} - SHA-256 hash
 */
function generateOrderHash(order) {
    const {
        id,
        userId,
        items,
        quantity,
        status,
        timestamp
    } = order;
    // Flatten items for hash
    const itemsString = Array.isArray(items) ? items.map(i => `${i.productId}:${i.quantity}`).join(',') : '';
    const hashString = `${id}|${userId}|${itemsString}|${quantity}|${status}|${timestamp}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
}

module.exports = { generateOrderHash };