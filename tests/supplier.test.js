const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, seedOrder, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Supplier portal', () => {
  let users;
  let product;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    product = await seedProduct(users.supplier.id);
    await seedOrder(users.customer.id, product.name, { status: 'confirmed' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/supplier/products returns own products', async () => {
    const res = await request(app)
      .get('/api/supplier/products')
      .set(authHeader(tokenFor(users.supplier)));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Laptop');
  });

  test('GET /api/supplier/orders returns orders for supplier products', async () => {
    const res = await request(app)
      .get('/api/supplier/orders')
      .set(authHeader(tokenFor(users.supplier)));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].item).toBe(product.name);
  });

  test('GET /api/supplier/orders filters by status', async () => {
    const res = await request(app)
      .get('/api/supplier/orders?status=confirmed')
      .set(authHeader(tokenFor(users.supplier)));

    expect(res.status).toBe(200);
    expect(res.body.every((o) => o.status === 'confirmed')).toBe(true);
  });

  test('GET /api/supplier/products/:id/sales returns sales stats', async () => {
    const res = await request(app)
      .get(`/api/supplier/products/${product.id}/sales`)
      .set(authHeader(tokenFor(users.supplier)));

    expect(res.status).toBe(200);
    expect(res.body.productId).toBe(product.id);
    expect(res.body.totalSold).toBeGreaterThan(0);
    expect(res.body.estimatedRevenue).toBeGreaterThan(0);
  });
});
