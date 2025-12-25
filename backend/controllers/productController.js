const prisma = require('../config/prismaClient');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price required' });
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock_quantity: stock_quantity || 0,
        createdBy: req.user.id
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Create failed', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
