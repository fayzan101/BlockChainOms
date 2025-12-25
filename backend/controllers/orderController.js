const prisma = require('../config/prismaClient');

// Get all orders
exports.getOrders = async (req, res) => {
	try {
		const orders = await prisma.order.findMany({ include: { user: true } });
		res.json(orders);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch orders' });
	}
};

// Get order by ID
exports.getOrderById = async (req, res) => {
	try {
		const order = await prisma.order.findUnique({
			where: { id: parseInt(req.params.id) },
			include: { user: true },
		});
		if (!order) return res.status(404).json({ error: 'Order not found' });
		res.json(order);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch order' });
	}
};

// Create order
exports.createOrder = async (req, res) => {
	try {
		const { item, quantity, userId } = req.body;
		const order = await prisma.order.create({
			data: { item, quantity, userId },
		});
		res.status(201).json(order);
	} catch (err) {
		res.status(500).json({ error: 'Failed to create order' });
	}
};

// Update order
exports.updateOrder = async (req, res) => {
	try {
		const { item, quantity, userId } = req.body;
		const order = await prisma.order.update({
			where: { id: parseInt(req.params.id) },
			data: { item, quantity, userId },
		});
		res.json(order);
	} catch (err) {
		res.status(500).json({ error: 'Failed to update order' });
	}
};

// Delete order
exports.deleteOrder = async (req, res) => {
	try {
		await prisma.order.delete({
			where: { id: parseInt(req.params.id) },
		});
		res.json({ message: 'Order deleted' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete order' });
	}
};