const request = require('supertest');
const { createApp } = require('../backend/app');

const app = createApp();

describe('Health', () => {
  test('GET /api/ping returns pong', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('pong');
  });

  test('GET /health returns status and database', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });
});
