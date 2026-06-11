const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('RBAC', () => {
  let users;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('unauthenticated users cannot list users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('customer cannot list all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set(authHeader(tokenFor(users.customer)));
    expect(res.status).toBe(403);
  });

  test('admin can list users without passwords', async () => {
    const res = await request(app)
      .get('/api/users')
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].password).toBeUndefined();
  });

  test('customer can read own profile via users endpoint', async () => {
    const res = await request(app)
      .get(`/api/users/${users.customer.id}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('customer@test.local');
  });

  test('customer cannot read another user', async () => {
    const res = await request(app)
      .get(`/api/users/${users.admin.id}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(403);
  });

  test('admin can access dashboard stats', async () => {
    const res = await request(app)
      .get('/api/stats/dashboard')
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('orders');
  });

  test('customer cannot access dashboard stats', async () => {
    const res = await request(app)
      .get('/api/stats/dashboard')
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(403);
  });

  test('supplier can update order status', async () => {
    const product = await seedProduct(users.supplier.id);

    const order = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    expect(order.status).toBe(201);

    const res = await request(app)
      .put(`/api/orders/${order.body.id}`)
      .set(authHeader(tokenFor(users.supplier)))
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });
});
