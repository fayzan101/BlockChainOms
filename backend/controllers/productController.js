const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock_quantity, categoryId } = req.body;

  const existing = await prisma.product.findUnique({ where: { name } });
  if (existing) {
    throw new AppError('Product name already exists', 409);
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock_quantity,
      categoryId,
      createdBy: req.user.id,
    },
    include: { category: true },
  });

  res.status(201).json(product);
});

exports.getProducts = asyncHandler(async (req, res) => {
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : undefined;
  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: { category: true },
    orderBy: { id: 'asc' },
  });
  res.json(products);
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.json(product);
});

exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  });
  res.json(products);
});

exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 10;
  const products = await prisma.product.findMany({
    where: { stock_quantity: { lte: threshold } },
    orderBy: { stock_quantity: 'asc' },
  });
  res.json(products);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }
  if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const { name, description, price, stock_quantity, categoryId } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (stock_quantity !== undefined) data.stock_quantity = stock_quantity;
  if (categoryId !== undefined) {
    if (categoryId === null) {
      data.categoryId = null;
    } else {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) throw new AppError('Category not found', 404);
      data.categoryId = categoryId;
    }
  }

  if (name && name !== product.name) {
    const duplicate = await prisma.product.findUnique({ where: { name } });
    if (duplicate) {
      throw new AppError('Product name already exists', 409);
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
  res.json(updated);
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }
  if (product.createdBy !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  await prisma.product.delete({ where: { id } });
  res.json({ message: 'Deleted' });
});
