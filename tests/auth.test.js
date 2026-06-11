const request = require('supertest');
const { createApp } = require('../backend/app');
const { resetDatabase } = require('./helpers');

const app = createApp();

describe('Authentication', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    const { prisma } = require('./helpers');
    await prisma.$disconnect();
  });

  test('registers a customer without exposing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@test.local',
        password: 'password123',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('jane@test.local');
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects self-assigned admin role on register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Evil Admin',
        email: 'evil@test.local',
        password: 'password123',
        role: 'admin',
      });

    expect(res.status).toBe(400);
  });

  test('logs in and returns token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@test.local', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.local', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  test('GET /api/auth/me returns profile for authenticated user', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Profile User', email: 'profile@test.local', password: 'password123' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@test.local', password: 'password123' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('profile@test.local');
    expect(res.body.password).toBeUndefined();
  });

  test('PUT /api/auth/me updates profile', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Update User', email: 'update@test.local', password: 'password123' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'update@test.local', password: 'password123' });

    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.password).toBeUndefined();
  });
});
