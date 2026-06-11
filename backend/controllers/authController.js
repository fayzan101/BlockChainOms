const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');
const AppError = require('../errors/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { PUBLIC_USER_SELECT, sanitizeUser } = require('../utils/user');

const BCRYPT_ROUNDS = 10;

exports.register = asyncHandler(async (req, res) => {
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

  res.status(201).json({ message: 'User registered', user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );

  res.json({ token, role: user.role, user: sanitizeUser(user) });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: PUBLIC_USER_SELECT,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const data = {};

  if (name) data.name = name;
  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: req.user.id } },
    });
    if (existing) {
      throw new AppError('Email already in use', 409);
    }
    data.email = email;
  }
  if (password) {
    data.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: PUBLIC_USER_SELECT,
  });

  res.json(user);
});
