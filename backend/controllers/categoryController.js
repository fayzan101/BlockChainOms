const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new AppError('Category not found', 404);
  res.json(category);
});

exports.getCategoryProducts = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new AppError('Category not found', 404);

  const products = await prisma.product.findMany({
    where: { categoryId: req.params.id },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
  res.json(products);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new AppError('Category already exists', 409);

  const category = await prisma.category.create({ data: { name, description } });
  res.status(201).json(category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;

  if (name) {
    const dup = await prisma.category.findFirst({
      where: { name, NOT: { id: req.params.id } },
    });
    if (dup) throw new AppError('Category name already exists', 409);
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data,
  });
  res.json(category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (count > 0) {
    throw new AppError('Cannot delete category with assigned products', 400);
  }
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Category deleted' });
});
