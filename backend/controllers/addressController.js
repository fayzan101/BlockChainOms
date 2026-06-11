const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');

async function clearDefaultAddresses(userId, tx = prisma) {
  await tx.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
}

exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
  res.json(addresses);
});

exports.getAddressById = asyncHandler(async (req, res) => {
  const address = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!address) throw new AppError('Address not found', 404);
  if (address.userId !== req.user.id) throw new AppError('Forbidden', 403);
  res.json(address);
});

exports.createAddress = asyncHandler(async (req, res) => {
  const data = { ...req.body, userId: req.user.id };

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await clearDefaultAddresses(req.user.id, tx);
    }
    return tx.address.create({ data });
  });

  res.status(201).json(address);
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError('Address not found', 404);
  if (existing.userId !== req.user.id) throw new AppError('Forbidden', 403);

  const address = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) {
      await clearDefaultAddresses(req.user.id, tx);
    }
    return tx.address.update({
      where: { id: req.params.id },
      data: req.body,
    });
  });

  res.json(address);
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!address) throw new AppError('Address not found', 404);
  if (address.userId !== req.user.id) throw new AppError('Forbidden', 403);

  await prisma.address.delete({ where: { id: req.params.id } });
  res.json({ message: 'Address deleted' });
});

exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await prisma.address.findUnique({ where: { id: req.params.id } });
  if (!address) throw new AppError('Address not found', 404);
  if (address.userId !== req.user.id) throw new AppError('Forbidden', 403);

  const updated = await prisma.$transaction(async (tx) => {
    await clearDefaultAddresses(req.user.id, tx);
    return tx.address.update({
      where: { id: req.params.id },
      data: { isDefault: true },
    });
  });

  res.json(updated);
});
