const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Inventory summary', () => {
  let users;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    await seedProduct(users.supplier.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/inventory/summary returns stock overview', async () => {
    const res = await request(app)
      .get('/api/inventory/summary')
      .set(authHeader(tokenFor(users.supplier)));

    expect(res.status).toBe(200);
    expect(res.body.totalProducts).toBe(1);
    expect(res.body).toHaveProperty('totalUnits');
    expect(res.body).toHaveProperty('lowStockThreshold');
  });

  test('GET /api/inventory/summary works for admin', async () => {
    const res = await request(app)
      .get('/api/inventory/summary')
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.totalProducts).toBeGreaterThanOrEqual(1);
  });
});
