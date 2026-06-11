const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../backend/config/prismaClient');

async function resetDatabase() {
  await prisma.review.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const password = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@test.local', password, role: 'admin' },
  });
  const supplier = await prisma.user.create({
    data: { name: 'Supplier', email: 'supplier@test.local', password, role: 'supplier' },
  });
  const customer = await prisma.user.create({
    data: { name: 'Customer', email: 'customer@test.local', password, role: 'customer' },
  });
  return { admin, supplier, customer, password: 'password123' };
}

async function seedCategory(overrides = {}) {
  return prisma.category.create({
    data: {
      name: overrides.name || 'Electronics',
      description: overrides.description || 'Gadgets and devices',
      ...overrides,
    },
  });
}

async function seedProduct(supplierId, overrides = {}) {
  return prisma.product.create({
    data: {
      name: overrides.name || 'Test Laptop',
      description: 'Test product',
      price: 999.99,
      stock_quantity: 50,
      createdBy: supplierId,
      ...overrides,
    },
  });
}

async function seedOrder(customerId, productName, overrides = {}) {
  return prisma.order.create({
    data: {
      item: productName,
      quantity: 1,
      userId: customerId,
      status: 'pending',
      ...overrides,
    },
  });
}

function tokenFor(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  resetDatabase,
  seedUsers,
  seedCategory,
  seedProduct,
  seedOrder,
  tokenFor,
  authHeader,
  prisma,
};
