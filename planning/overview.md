# **Project Overview – Blockchain-based OMS**

**Project Name:** `Blockchain OMS`
**Tech Stack:**

* **Backend:** Node.js + Express + TypeScript + Sequelize
* **Database:** PostgreSQL
* **Frontend:** Electron + React/TypeScript
* **Blockchain:** Hyperledger Fabric + Chaincode
* **Authentication:** JWT (Role-based)
* **Other:** dotenv, cors, bcrypt, axios

**Goal:**
To build a secure, decentralized order management system where all order transactions are recorded on a blockchain ledger for transparency and auditability while maintaining relational database support for efficient queries.

---

## **1️⃣ Core Features**

### **1. User Management**

* **Register** (Customer, Vendor, Admin)
* **Login / Logout**
* **Role-based access control**
* **Password encryption** using bcrypt
* **Profile management** (update name, email, password)

### **2. Order Management**

* **Create Order** (Customer or Vendor)

  * Items, quantity, price
  * Order status: Pending → Shipped → Delivered
* **Update Order** (Vendor/Admin)

  * Update status or items
* **Delete Order** (soft delete)
* **View Orders**

  * By user (Customer view)
  * All orders (Admin)
  * Vendor-specific orders

### **3. Blockchain Integration**

* Record **every order creation/update** on Hyperledger Fabric
* Maintain **immutable order history**
* Retrieve **order ledger history** from blockchain
* Synchronize blockchain transactions with PostgreSQL

### **4. Authentication & Authorization**

* JWT-based authentication
* Role-based authorization:

  * **Admin:** View all orders, manage users, approve/reject orders
  * **Vendor:** Manage own orders, update order status
  * **Customer:** Place orders, view own orders

### **5. Frontend (Electron App)**

* **Login & Registration** pages
* **Dashboard**:

  * View orders
  * Create orders
  * Order status visualization
  * Blockchain history view
* Notifications for order updates
* Responsive UI for desktop

### **6. Additional Features**

* **Search orders** by ID, status, or user
* **Filter orders** by date, status, or vendor
* **Audit trail** via blockchain (immutable logs)
* **Environment variable management** using `.env`
* **Error handling & input validation** in backend

---

## **2️⃣ API Endpoints**

### **2.1 User APIs**

| Method | Endpoint            | Description                | Auth Required |
| ------ | ------------------- | -------------------------- | ------------- |
| POST   | /api/users/register | Register a new user        | No            |
| POST   | /api/users/login    | Login and return JWT       | No            |
| GET    | /api/users/profile  | Get current user profile   | Yes           |
| PUT    | /api/users/profile  | Update user profile        | Yes           |
| GET    | /api/users          | Get all users (admin only) | Yes           |
| DELETE | /api/users/:id      | Delete user (admin only)   | Yes           |

---

### **2.2 Order APIs**

| Method | Endpoint                | Description                     | Auth Required | Roles           |
| ------ | ----------------------- | ------------------------------- | ------------- | --------------- |
| POST   | /api/orders             | Create a new order              | Yes           | Customer/Vendor |
| GET    | /api/orders             | Get all orders                  | Yes           | Admin           |
| GET    | /api/orders/:id         | Get single order by ID          | Yes           | All             |
| PUT    | /api/orders/:id         | Update order (status/items)     | Yes           | Vendor/Admin    |
| DELETE | /api/orders/:id         | Soft delete order               | Yes           | Admin           |
| GET    | /api/orders/history/:id | Get blockchain history of order | Yes           | All             |

---

### **2.3 Blockchain Integration APIs**

| Method | Endpoint                     | Description                         | Auth Required |
| ------ | ---------------------------- | ----------------------------------- | ------------- |
| POST   | /api/blockchain/order/create | Record order creation on blockchain | Yes           |
| POST   | /api/blockchain/order/update | Record order update on blockchain   | Yes           |
| GET    | /api/blockchain/order/:id    | Fetch order ledger history          | Yes           |

---

## **3️⃣ Database Models**

### **3.1 User**

* `id` (PK)
* `name`
* `email` (unique)
* `password` (hashed)
* `role` (customer/vendor/admin)
* `createdAt`, `updatedAt`

### **3.2 Order**

* `id` (PK)
* `userId` (FK → User)
* `items` (JSONB)
* `status` (pending, shipped, delivered)
* `createdAt`, `updatedAt`

---

## **4️⃣ Blockchain Components**

### **4.1 Chaincode (Go / Node)**

* `CreateOrder(orderID, userID, items, status)`
* `UpdateOrder(orderID, status)`
* `QueryOrder(orderID)` → returns immutable order history

### **4.2 Fabric Network**

* Test network with 2 organizations:

  * Org1: Admin/Vendor
  * Org2: Customers
* Each transaction is signed and logged
* Backend communicates using **fabric-network SDK**

---

## **5️⃣ Frontend Components**

| Component             | Purpose                      |
| --------------------- | ---------------------------- |
| Login.tsx             | Login page with JWT auth     |
| Register.tsx          | User registration form       |
| Dashboard.tsx         | Main page showing orders     |
| OrderCard.tsx         | Display single order details |
| OrderForm.tsx         | Create or update orders      |
| BlockchainHistory.tsx | Show immutable order logs    |

---

## **6️⃣ Utilities & Middleware**

* **JWT Middleware** → verify token and role
* **Error Handler Middleware** → standardize API errors
* **Validation Utils** → validate user input, order fields
* **Env Config** → store DB credentials, JWT secrets

---

## **7️⃣ Project Flow Overview**

1. **User logs in** → JWT issued
2. **Customer creates order** → stored in PostgreSQL + blockchain
3. **Vendor/Admin updates order** → status update recorded in both DB & blockchain
4. **Dashboard fetches data** → shows live DB orders + blockchain ledger
5. **Audit/History feature** → fetches blockchain history for transparency
6. **Admin** can manage users, view all orders, enforce rules

---

## **8️⃣ Optional Advanced Features**

* **Email notifications** on order updates
* **Search & Filter UI** for orders
* **Order analytics dashboard**
* **Electron packaging** → deliver as desktop app

---

This gives you a **complete blueprint** for your Blockchain OMS project. It defines **everything** you need to implement, from DB models to APIs, frontend, blockchain, authentication, and extra features.

---
