require('dotenv').config();

process.env.NODE_ENV = 'test';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret';
}
