const bcrypt = require('bcrypt');
const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { PUBLIC_USER_SELECT, sanitizeUser } = require('../utils/user');

const BCRYPT_ROUNDS = 10;

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: PUBLIC_USER_SELECT,
    orderBy: { id: 'asc' },
  });
  res.json(users);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new AppError('Forbidden', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: PUBLIC_USER_SELECT,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: PUBLIC_USER_SELECT,
  });

  res.status(201).json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user.id === id;

  if (!isAdmin && !isSelf) {
    throw new AppError('Forbidden', 403);
  }

  const { name, email, password, role } = req.body;
  const data = {};

  if (name) data.name = name;
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (existing) {
      throw new AppError('Email already in use', 409);
    }
    data.email = email;
  }
  if (password) {
    data.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }
  if (role) {
    if (!isAdmin) {
      throw new AppError('Only admins can change roles', 403);
    }
    data.role = role;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: PUBLIC_USER_SELECT,
  });

  res.json(user);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (req.user.id === id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
});
