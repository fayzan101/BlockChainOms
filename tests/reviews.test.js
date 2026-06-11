const request = require('supertest');
const { createApp } = require('../backend/app');
const {
  resetDatabase, seedUsers, seedProduct, seedOrder, tokenFor, authHeader, prisma,
} = require('./helpers');

const app = createApp();

describe('Reviews', () => {
  let users;
  let product;

  beforeEach(async () => {
    await resetDatabase();
    users = await seedUsers();
    product = await seedProduct(users.supplier.id);
    await seedOrder(users.customer.id, product.name, { status: 'delivered' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('POST /api/reviews creates review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set(authHeader(tokenFor(users.customer)))
      .send({ productId: product.id, rating: 5, comment: 'Great product!' });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  test('GET /api/reviews/product/:productId returns reviews and stats', async () => {
    await request(app)
      .post('/api/reviews')
      .set(authHeader(tokenFor(users.customer)))
      .send({ productId: product.id, rating: 4, comment: 'Good' });

    const res = await request(app).get(`/api/reviews/product/${product.id}`);

    expect(res.status).toBe(200);
    expect(res.body.totalReviews).toBe(1);
    expect(res.body.averageRating).toBe(4);
    expect(res.body.reviews).toHaveLength(1);
  });

  test('DELETE /api/reviews/:id deletes review', async () => {
    const created = await request(app)
      .post('/api/reviews')
      .set(authHeader(tokenFor(users.customer)))
      .send({ productId: product.id, rating: 3 });

    const res = await request(app)
      .delete(`/api/reviews/${created.body.id}`)
      .set(authHeader(tokenFor(users.customer)));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Review deleted');
  });
});
