const request = require('supertest');
const { createApp } = require('../backend/app');
const { resetDatabase, seedUsers, tokenFor, authHeader, prisma } = require('./helpers');

const app = createApp();

describe('Users admin CRUD', () => {
  let users;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /api/users creates user (admin)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set(authHeader(tokenFor(users.admin)))
      .send({
        name: 'New Supplier',
        email: 'newsupplier@test.local',
        password: 'password123',
        role: 'supplier',
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('newsupplier@test.local');
    expect(res.body.password).toBeUndefined();
  });

  test('PUT /api/users/:id updates own profile', async () => {
    const res = await request(app)
      .put(`/api/users/${users.customer.id}`)
      .set(authHeader(tokenFor(users.customer)))
      .send({ name: 'Updated Customer' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Customer');
  });

  test('PUT /api/users/:id allows admin to change role', async () => {
    const res = await request(app)
      .put(`/api/users/${users.customer.id}`)
      .set(authHeader(tokenFor(users.admin)))
      .send({ role: 'supplier' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('supplier');
  });

  test('DELETE /api/users/:id deletes user (admin)', async () => {
    const created = await request(app)
      .post('/api/users')
      .set(authHeader(tokenFor(users.admin)))
      .send({
        name: 'Temp User',
        email: 'temp@test.local',
        password: 'password123',
        role: 'customer',
      });

    const res = await request(app)
      .delete(`/api/users/${created.body.id}`)
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted');
  });
});
