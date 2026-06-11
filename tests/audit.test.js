const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Audit logs', () => {
  let users;
  let product;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    product = await seedProduct(users.supplier.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/audit-logs returns logs after order update', async () => {
    const order = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    await request(app)
      .put(`/api/orders/${order.body.id}`)
      .set(authHeader(tokenFor(users.supplier)))
      .send({ status: 'confirmed' });

    const res = await request(app)
      .get('/api/audit-logs')
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].action).toBe('UPDATE');
  });

  test('GET /api/audit-logs/:id returns single log', async () => {
    const order = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    await request(app)
      .put(`/api/orders/${order.body.id}`)
      .set(authHeader(tokenFor(users.supplier)))
      .send({ status: 'confirmed' });

    const list = await request(app)
      .get('/api/audit-logs')
      .set(authHeader(tokenFor(users.admin)));

    const res = await request(app)
      .get(`/api/audit-logs/${list.body[0].id}`)
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(list.body[0].id);
  });

  test('GET /api/audit-logs rejects non-admin', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(403);
  });
});
