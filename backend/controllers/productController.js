const { Product } = require('../models/product');

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price required' });
    }
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      createdBy: req.user.id
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Create failed', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await product.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
