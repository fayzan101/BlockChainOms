const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedCategory, seedProduct, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Categories', () => {
  let users;
  let category;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    category = await seedCategory();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/categories lists categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/categories creates category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set(authHeader(tokenFor(users.admin)))
      .send({ name: 'Books', description: 'Reading' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Books');
  });

  test('GET /api/categories/:id returns category', async () => {
    const res = await request(app).get(`/api/categories/${category.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Electronics');
  });

  test('GET /api/categories/:id/products returns products', async () => {
    await seedProduct(users.supplier.id, { categoryId: category.id });

    const res = await request(app).get(`/api/categories/${category.id}/products`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('PUT /api/categories/:id updates category', async () => {
    const res = await request(app)
      .put(`/api/categories/${category.id}`)
      .set(authHeader(tokenFor(users.admin)))
      .send({ name: 'Electronics & Gadgets' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Electronics & Gadgets');
  });

  test('DELETE /api/categories/:id deletes empty category', async () => {
    const empty = await request(app)
      .post('/api/categories')
      .set(authHeader(tokenFor(users.admin)))
      .send({ name: 'Empty Category' });

    const res = await request(app)
      .delete(`/api/categories/${empty.body.id}`)
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Category deleted');
  });
});
