const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Notifications', () => {
  let users;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createNotificationViaOrder() {
    const product = await seedProduct(users.supplier.id);
    await request(app)
      .post('/api/orders')
      .set(authHeader(tokenFor(users.customer)))
      .send({ item: product.name, quantity: 1 });
  }

  test('GET /api/notifications/unread-count', async () => {
    await createNotificationViaOrder();

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('PATCH /api/notifications/:id/read marks as read', async () => {
    await createNotificationViaOrder();

    const list = await request(app)
      .get('/api/notifications')
      .set(authHeader(tokenFor(users.customer)));

    const res = await request(app)
      .patch(`/api/notifications/${list.body[0].id}/read`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  test('PATCH /api/notifications/read-all marks all as read', async () => {
    await createNotificationViaOrder();

    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);

    const count = await request(app)
      .get('/api/notifications/unread-count')
      .set(authHeader(tokenFor(users.customer)));

    expect(count.body.count).toBe(0);
  });

  test('DELETE /api/notifications/:id deletes notification', async () => {
    await createNotificationViaOrder();

    const list = await request(app)
      .get('/api/notifications')
      .set(authHeader(tokenFor(users.customer)));

    const res = await request(app)
      .delete(`/api/notifications/${list.body[0].id}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Notification deleted');
  });
});
