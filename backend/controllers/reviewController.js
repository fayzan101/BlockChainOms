const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { PUBLIC_USER_SELECT } = require('../utils/user');

async function assertCanReview(userId, product) {
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      item: product.name,
      status: 'delivered',
    },
  });
  if (!deliveredOrder) {
    throw new AppError('You can only review products from delivered orders', 403);
  }
}

exports.getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId || req.params.id;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: PUBLIC_USER_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  res.json({
    productId,
    averageRating: stats._avg.rating || 0,
    totalReviews: stats._count.rating,
    reviews,
  });
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  await assertCanReview(req.user.id, product);

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: req.user.id } },
  });
  if (existing) throw new AppError('You already reviewed this product', 409);

  const review = await prisma.review.create({
    data: { productId, userId: req.user.id, rating, comment },
    include: { user: { select: PUBLIC_USER_SELECT } },
  });

  res.status(201).json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw new AppError('Review not found', 404);
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ message: 'Review deleted' });
});
