const request = require('supertest');
const { createApp } = require('../backend/app');
const { resetDatabase, seedUsers, tokenFor, authHeader, prisma } = require('./helpers');

const app = createApp();

describe('Addresses', () => {
  let users;
  let addressId;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();

    const created = await request(app)
      .post('/api/addresses')
      .set(authHeader(tokenFor(users.customer)))
      .send({
        label: 'Home',
        street: '123 Main St',
        city: 'NYC',
        postalCode: '10001',
        isDefault: true,
      });

    addressId = created.body.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/addresses/:id returns address', async () => {
    const res = await request(app)
      .get(`/api/addresses/${addressId}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.street).toBe('123 Main St');
  });

  test('PUT /api/addresses/:id updates address', async () => {
    const res = await request(app)
      .put(`/api/addresses/${addressId}`)
      .set(authHeader(tokenFor(users.customer)))
      .send({ city: 'Brooklyn' });

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Brooklyn');
  });

  test('PATCH /api/addresses/:id/default sets default', async () => {
    const second = await request(app)
      .post('/api/addresses')
      .set(authHeader(tokenFor(users.customer)))
      .send({
        label: 'Work',
        street: '456 Office Blvd',
        city: 'NYC',
        postalCode: '10002',
      });

    const res = await request(app)
      .patch(`/api/addresses/${second.body.id}/default`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.isDefault).toBe(true);
  });

  test('DELETE /api/addresses/:id deletes address', async () => {
    const res = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Address deleted');
  });
});
