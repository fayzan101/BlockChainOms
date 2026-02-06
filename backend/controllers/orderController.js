const prisma = require('../config/prismaClient');


const { generateOrderHash, storeHashOnChain, getHashFromChain } = require('../../services/blockchainService');



exports.verifyOrder = async (req, res) => {
	try {
		const orderId = parseInt(req.params.id);
		const order = await prisma.order.findUnique({ where: { id: orderId } });
		if (!order) return res.status(404).json({ error: 'Order not found' });


		const currentHash = generateOrderHash(order);

		const blockchainHash = await getHashFromChain(orderId);

		const verified = currentHash === blockchainHash;
		res.json({
			orderId,
			dbHash: currentHash,
			blockchainHash,
			verified
		});
	} catch (err) {
		console.error('Verify Order Error:', err);
		res.status(500).json({ error: 'Verification failed' });
	}
};


exports.getOrders = async (req, res) => {
	try {
		const orders = await prisma.order.findMany({ include: { user: true } });
		res.json(orders);
	} catch (err) {
		console.error('Get Orders Error:', err);
		res.status(500).json({ error: 'Failed to fetch orders' });
	}
};


exports.getOrderById = async (req, res) => {
	try {
		const order = await prisma.order.findUnique({
			where: { id: parseInt(req.params.id) },
			include: { user: true },
		});
		if (!order) return res.status(404).json({ error: 'Order not found' });
		res.json(order);
	} catch (err) {
		console.error('Get Order By ID Error:', err);
		res.status(500).json({ error: 'Failed to fetch order' });
	}
};


exports.createOrder = async (req, res) => {
	try {
		const { item, quantity, userId } = req.body;

		const product = await prisma.product.findUnique({ where: { name: item } });
		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}
		if (product.stock_quantity < quantity) {
			return res.status(400).json({ error: 'Insufficient stock' });
		}

		await prisma.product.update({
			where: { id: product.id },
			data: { stock_quantity: { decrement: quantity } }
		});

		const order = await prisma.order.create({
			data: { item, quantity, userId },
		});


		const hash = generateOrderHash(order);





		await storeHashOnChain(order.id, hash);

		res.status(201).json(order);
	} catch (err) {
		console.error('Create Order Error:', err);
		res.status(500).json({ error: 'Failed to create order' });
	}
};


exports.updateOrder = async (req, res) => {
	try {
		const { item, quantity, userId, status } = req.body;
		const orderId = parseInt(req.params.id);
		const oldOrder = await prisma.order.findUnique({ where: { id: orderId } });
		if (!oldOrder) return res.status(404).json({ error: 'Order not found' });


		const userRole = req.user.role;
		const userIdFromToken = req.user.id;
		if (userRole === 'customer' && oldOrder.userId !== userIdFromToken) {
			return res.status(403).json({ error: 'Customers can only update their own orders' });
		}
		if (userRole === 'customer' && status && status !== oldOrder.status) {
			return res.status(403).json({ error: 'Customers cannot change order status' });
		}
		if (userRole === 'supplier' && status && !['confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
			return res.status(403).json({ error: 'Suppliers can only update order status' });
		}
		if (userRole === 'supplier' && (item || quantity)) {
			return res.status(403).json({ error: 'Suppliers cannot change order items or quantity' });
		}


		const validTransitions = {
			pending: ['confirmed', 'cancelled'],
			confirmed: ['shipped', 'cancelled'],
			shipped: ['delivered'],
			delivered: [],
			cancelled: []
		};
		if (status && oldOrder.status !== status) {
			const allowed = validTransitions[oldOrder.status] || [];
			if (!allowed.includes(status)) {
				return res.status(400).json({ error: `Invalid status transition from ${oldOrder.status} to ${status}` });
			}
		}

		const oldHash = generateOrderHash({
			id: oldOrder.id,
			userId: oldOrder.userId,
			items: [{ productId: oldOrder.item, quantity: oldOrder.quantity }],
			quantity: oldOrder.quantity,
			status: oldOrder.status,
			timestamp: oldOrder.updatedAt
		});

		const order = await prisma.order.update({
			where: { id: orderId },
			data: { item, quantity, userId, status },
		});
		const newHash = generateOrderHash({
			id: order.id,
			userId: order.userId,
			items: [{ productId: order.item, quantity: order.quantity }],
			quantity: order.quantity,
			status: order.status,
			timestamp: order.updatedAt
		});


		const blockchainTxId = await storeOrderHashOnBlockchain(order.id, newHash);

		await prisma.auditLog.create({
			data: {
				order_id: order.id,
				action: 'UPDATE',
				performed_by: userId,
				old_hash: oldHash,
				new_hash: newHash,
				blockchain_tx_id: blockchainTxId,
				timestamp: order.updatedAt
			}
		});
		res.json(order);
	} catch (err) {
		console.error('Update Order Error:', err);
		res.status(500).json({ error: 'Failed to update order' });
	}
};


exports.deleteOrder = async (req, res) => {
	try {
		await prisma.order.delete({
			where: { id: parseInt(req.params.id) },
		});
		res.json({ message: 'Order deleted' });
	} catch (err) {
		console.error('Delete Order Error:', err);
		res.status(500).json({ error: 'Failed to delete order' });
	}
};