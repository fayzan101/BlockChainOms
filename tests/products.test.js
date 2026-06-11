const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, seedCategory, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Products', () => {
  let users;
  let product;
  let category;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    category = await seedCategory();
    product = await seedProduct(users.supplier.id, { categoryId: category.id });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/products lists products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBeDefined();
  });

  test('GET /api/products filters by categoryId', async () => {
    const res = await request(app).get(`/api/products?categoryId=${category.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/products/:id returns product', async () => {
    const res = await request(app).get(`/api/products/${product.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Laptop');
  });

  test('GET /api/products/search finds by name', async () => {
    const res = await request(app).get('/api/products/search?q=laptop');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/products/low-stock returns low stock items', async () => {
    await seedProduct(users.supplier.id, {
      name: 'Low Stock Item',
      stock_quantity: 3,
    });
    const res = await request(app).get('/api/products/low-stock?threshold=5');
    expect(res.status).toBe(200);
    expect(res.body.some((p) => p.name === 'Low Stock Item')).toBe(true);
  });

  test('POST /api/products creates product (supplier)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(tokenFor(users.supplier)))
      .send({
        name: 'New Phone',
        description: 'Smartphone',
        price: 499.99,
        stock_quantity: 20,
        categoryId: category.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Phone');
  });

  test('PUT /api/products/:id updates product (owner)', async () => {
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .set(authHeader(tokenFor(users.supplier)))
      .send({ price: 899.99 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(899.99);
  });

  test('DELETE /api/products/:id deletes product (admin)', async () => {
    const res = await request(app)
      .delete(`/api/products/${product.id}`)
      .set(authHeader(tokenFor(users.admin)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Deleted');
  });
});
