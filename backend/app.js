const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const statsRoutes = require('./routes/statsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const addressRoutes = require('./routes/addressRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

function resolveServerUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('x-forwarded-host') || req.get('host');
  if (host) {
    return `${proto}://${host}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blockchain OMS API',
      version: '2.0.0',
      description: 'REST API for the Blockchain Order Management System. Use the production URL (block-chain-oms.vercel.app) in Swagger — preview deployment URLs require Vercel login and may fail with "Failed to fetch".',
    },
    servers: [{ url: '/', description: 'Current host (use this in the browser)' }],
    tags: [
      { name: 'Health', description: 'Server health' },
      { name: 'Authentication', description: 'Registration, login, profile' },
      { name: 'Products', description: 'Product catalog' },
      { name: 'Orders', description: 'Orders and blockchain verification' },
      { name: 'Users', description: 'Admin user management' },
      { name: 'Stats', description: 'Dashboard analytics' },
      { name: 'Audit', description: 'Order audit trail' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Inventory', description: 'Stock movements and adjustments' },
      { name: 'Addresses', description: 'Shipping addresses' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Supplier', description: 'Supplier portal' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, 'swagger', '*.js'),
    path.join(__dirname, 'routes', '*.js'),
  ],
};

function createApp() {
  const app = express();
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_URL);
  app.use(helmet({
    contentSecurityPolicy: isVercel ? false : undefined,
  }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  const swaggerUiOptions = {
    customSiteTitle: 'Blockchain OMS API',
    swaggerOptions: { persistAuthorization: true },
  };
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get('/api-docs.json', (req, res) => {
    const spec = {
      ...swaggerSpec,
      servers: [{ url: resolveServerUrl(req), description: 'Current server' }],
    };
    res.setHeader('Content-Type', 'application/json');
    res.json(spec);
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 1000 : 10,
    message: 'Too many login/register attempts, please try again later.',
  });
  app.use('/api/auth', authLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/supplier', supplierRoutes);

  app.get('/api/ping', (req, res) => res.send('pong'));
  app.get('/health', async (req, res) => {
    const prisma = require('./config/prismaClient');
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'degraded', database: 'disconnected' });
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
