# Blockchain Order Management System (OMS)

A full-stack order management API with JWT authentication, role-based access control, PostgreSQL (Prisma), and optional Ethereum blockchain hash verification.

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + Express 5 |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Blockchain | ethers.js (demo mode when not configured) |
| API Docs | Swagger UI at `/api-docs` |
| Desktop UI | Electron + vanilla JS frontend |

## Project Structure

```
backend/
  app.js              # Express app factory (used by server + tests)
  server.js           # HTTP server entry point
  config/             # Prisma client
  controllers/        # Route handlers
  middleware/         # Auth, validation, errors, RBAC
  routes/             # API route definitions
  validators/         # Zod schemas
  swagger/            # OpenAPI component schemas
services/
  blockchainService.js  # Order hash storage (Ethereum or in-memory demo)
prisma/               # Schema and migrations
tests/                # Integration tests (Jest + Supertest)
frontend/             # Electron desktop client
```

## Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

## Setup

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL and JWT_SECRET
npm run db:generate
npm run db:migrate
npm run dev
```

Server: `http://localhost:5000`  
Swagger: `http://localhost:5000/api-docs`

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET=your_secret_here
PORT=5000

# Optional blockchain (omit for demo/in-memory mode)
RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
```

## API Overview

### Health
- `GET /health` — server + database status
- `GET /api/ping` — simple ping

### Authentication
- `POST /api/auth/register` — register as `customer` or `supplier` only
- `POST /api/auth/login` — receive JWT
- `GET /api/auth/me` — current user profile
- `PUT /api/auth/me` — update own profile

### Products
- `GET /api/products` — list all (public)
- `GET /api/products/:id` — get by ID (public)
- `GET /api/products/search?q=` — search by name/description
- `GET /api/products/low-stock?threshold=10` — low stock alert
- `POST /api/products` — create (admin, supplier)
- `PUT /api/products/:id` — update (owner or admin)
- `DELETE /api/products/:id` — delete (owner or admin)

### Orders
- `GET /api/orders` — list (scoped by role; customers see own only)
- `GET /api/orders/my` — current user's orders
- `GET /api/orders/:id` — get by ID
- `POST /api/orders` — create (admin, customer)
- `PUT /api/orders/:id` — update (admin, customer, supplier for status)
- `POST /api/orders/:id/cancel` — cancel order and restore stock
- `DELETE /api/orders/:id` — delete (admin)
- `GET /api/orders/:id/verify` — verify blockchain hash integrity

### Categories
- `GET /api/categories` — list categories (public)
- `GET /api/categories/:id` — get category (public)
- `GET /api/categories/:id/products` — products in category (public)
- `POST /api/categories` — create (admin)
- `PUT /api/categories/:id` — update (admin)
- `DELETE /api/categories/:id` — delete (admin)

### Notifications
- `GET /api/notifications` — list notifications
- `GET /api/notifications/unread-count` — unread count
- `PATCH /api/notifications/:id/read` — mark one as read
- `PATCH /api/notifications/read-all` — mark all as read
- `DELETE /api/notifications/:id` — delete notification

### Inventory
- `GET /api/inventory/summary` — stock overview (admin, supplier)
- `GET /api/inventory/movements` — stock movement history
- `POST /api/inventory/adjust` — manual stock adjustment

### Addresses
- `GET /api/addresses` — list shipping addresses (customer, admin)
- `POST /api/addresses` — add address
- `GET /api/addresses/:id` — get address
- `PUT /api/addresses/:id` — update address
- `PATCH /api/addresses/:id/default` — set default address
- `DELETE /api/addresses/:id` — delete address

### Reviews
- `GET /api/reviews/product/:productId` — product reviews and rating stats (public)
- `POST /api/reviews` — create review (customer, delivered orders only)
- `DELETE /api/reviews/:id` — delete own review (or admin)

### Supplier portal
- `GET /api/supplier/dashboard` — supplier metrics and recent orders
- `GET /api/supplier/products` — supplier's products
- `GET /api/supplier/orders` — orders for supplier's products
- `GET /api/supplier/products/:id/sales` — sales stats per product

### Users (authenticated)
- `GET /api/users` — list all (admin)
- `POST /api/users` — create user with any role (admin)
- `GET /api/users/:id` — get user (admin or self)
- `PUT /api/users/:id` — update (admin or self)
- `DELETE /api/users/:id` — delete (admin)

### Stats (admin)
- `GET /api/stats/dashboard` — counts, revenue estimate, recent orders

### Audit (admin)
- `GET /api/audit-logs` — order change audit trail
- `GET /api/audit-logs/:id` — single audit entry

## Roles

| Role | Capabilities |
|------|-------------|
| **customer** | Own orders, addresses, reviews; cancel pending orders |
| **supplier** | Manage own products, update order status |
| **admin** | Full access including user management and stats |

## Scripts

```bash
npm run dev          # Start API server
npm run test         # Run integration tests
npm run db:migrate   # Apply migrations
npm run db:studio    # Prisma Studio GUI
npm run electron     # Start desktop app
```

## Testing

Tests use the database configured in `DATABASE_URL` and **reset all tables** before each test. Use a dedicated test database or Neon branch.

```bash
npm test
```

## License

MIT
