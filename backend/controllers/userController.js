const prisma = require('../config/prismaClient');


exports.getUsers = async (req, res) => {
	try {
		const users = await prisma.user.findMany();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch users' });
	}
};


exports.getUserById = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: parseInt(req.params.id) },
		});
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch user' });
	}
};


exports.createUser = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const user = await prisma.user.create({
			data: { name, email, password, role },
		});
		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ error: 'Failed to create user' });
	}
};


exports.updateUser = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const user = await prisma.user.update({
			where: { id: parseInt(req.params.id) },
			data: { name, email, password, role },
		});
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: 'Failed to update user' });
	}
};


exports.deleteUser = async (req, res) => {
	try {
		await prisma.user.delete({
			where: { id: parseInt(req.params.id) },
		});
		res.json({ message: 'User deleted' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete user' });
	}
};