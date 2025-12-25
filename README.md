# Blockchain Order Management System (OMS)

A full-stack application for managing orders using blockchain technology, built with Node.js, Express, TypeScript, React, Sequelize, and Hyperledger Fabric.

![BlockChain](how-blockchain-works.jpg)

## Features
- User registration and authentication (JWT)
- Order creation, listing, and management
- Blockchain integration for order immutability (Hyperledger Fabric)
- PostgreSQL database with Sequelize ORM
- RESTful API backend
- Modern React frontend (with Dashboard, Login, Register, OrderCard components)

## Project Structure
```
backend/         # Node.js + Express + Sequelize API
  config/        # DB and Fabric config
  controllers/   # Route controllers
  middleware/    # Auth middleware
  models/        # Sequelize models
  routes/        # API routes
  server.js      # Main server entry
chaincode/       # Hyperledger Fabric chaincode (Go)
frontend/        # React frontend (TypeScript)
  components/    # UI components
planning/        # Project planning docs
scripts/         # Setup and deployment scripts
```

## Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (running on default port 5432)
- Hyperledger Fabric (for blockchain features)

## Setup
1. **Clone the repo:**
   ```
   git clone <repo-url>
   cd BlockChain Oms
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Configure environment:**
   - Copy `.env` to project root and set DB credentials:
     ```
     DB_NAME=blockchain_oms
     DB_USER=postgres
     DB_PASSWORD=secret
     DB_HOST=localhost
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```
4. **Start PostgreSQL:**
   - Ensure your PostgreSQL server is running and accessible.
5. **Build backend TypeScript (if needed):**
   ```
   npm run build
   ```
6. **Start the backend server:**
   ```
   npm run dev
   ```
7. **Frontend:**
   - (Add your React frontend start instructions here)

## API Endpoints
- `POST /api/register` — Register a new user
- `POST /api/login` — Login and get JWT
- `GET /api/orders` — List all orders (auth required)
- `POST /api/orders` — Create a new order (auth required)
- `GET /api/ping` — Health check

## Blockchain
- Chaincode is in `chaincode/order_chaincode.go`
- Scripts for Fabric setup in `scripts/`

## Development
- Backend: Node.js, Express, Sequelize, JWT
- Frontend: React, TypeScript
- Blockchain: Hyperledger Fabric, Go

## License
MIT