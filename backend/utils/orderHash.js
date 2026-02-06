const crypto = require('crypto');

function generateOrderHash(order) {
    const {
        id,
        userId,
        items,
        quantity,
        status,
        timestamp
    } = order;

    const itemsString = Array.isArray(items) ? items.map(i => `${i.productId}:${i.quantity}`).join(',') : '';
    const hashString = `${id}|${userId}|${itemsString}|${quantity}|${status}|${timestamp}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
}

module.exports = { generateOrderHash };