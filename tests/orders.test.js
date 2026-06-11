const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Orders', () => {
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

  test('customer only sees own orders', async () => {
    await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.admin)))
      .send({ item: product.name, quantity: 1, userId: users.admin.id });

    const customerOrders = await request(app)
      .get('/api/orders')
      .set(authHeader(tokenFor(users.customer)));

    expect(customerOrders.status).toBe(200);
    expect(customerOrders.body).toHaveLength(1);
    expect(customerOrders.body[0].userId).toBe(users.customer.id);
  });

  test('GET /api/orders/my returns current user orders', async () => {
    await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    const res = await request(app)
      .get('/api/orders/my')
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/orders/:id returns order details', async () => {
    const created = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    const res = await request(app)
      .get(`/api/orders/${created.body.id}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
    expect(res.body.user.password).toBeUndefined();
  });

  test('create order uses customer id from token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 2, userId: users.admin.id });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(users.customer.id);
  });

  test('create order decrements stock in transaction', async () => {
    await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 5 });

    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updated.stock_quantity).toBe(45);
  });

  test('verify order returns consistent hash after create', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    const verifyRes = await request(app)
      .get(`/api/orders/${createRes.body.id}/verify`)
      .set(authHeader(tokenFor(users.customer)));

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verified).toBe(true);
  });

  test('POST /api/orders/:id/cancel restores stock', async () => {
    const order = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 5 });

    await request(app)
      .post(`/api/orders/${order.body.id}/cancel`)
      .set(authHeader(tokenFor(users.customer)));

    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updated.stock_quantity).toBe(50);
  });

  test('DELETE /api/orders/:id deletes order (admin)', async () => {
    const order = await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });

    const res = await request(app)
      .delete(`/api/orders/${order.body.id}`)
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Order deleted');
  });
});
