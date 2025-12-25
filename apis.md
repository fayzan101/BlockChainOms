
# API Reference – Blockchain OMS Backend

## Base URL

```
http://localhost:5000
```

## Authentication

### Register
- **URL:** `POST /api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword",
  "role": "customer" // or "admin", "supplier"
}
```
- **Response:**
```json
{
  "message": "User registered",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "customer" }
}
```

---

### Login
- **URL:** `POST /api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "token": "<JWT_TOKEN>",
  "role": "customer"
}
```

---

## Products

### Create Product
- **URL:** `POST /api/products`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (admin/supplier only)
- **Body:**
```json
{
  "name": "Product Name",
  "description": "Details",
  "price": 99.99,
  "stock": 10
}
```
- **Response:** Product object

---

### Get All Products
- **URL:** `GET /api/products`
- **Response:** Array of product objects

---

### Update Product
- **URL:** `PUT /api/products/:id`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (admin/supplier only)
- **Body:**
```json
{
  "name": "New Name",
  "price": 120.00
}
```
- **Response:** Updated product object

---

### Delete Product
- **URL:** `DELETE /api/products/:id`
- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` (admin/supplier only)
- **Response:**
```json
{
  "message": "Deleted"
}
```

---

## Users & Orders
- See `/api/users` and `/api/orders` for additional endpoints (not detailed here).

---

## Notes
- All protected routes require a valid JWT in the `Authorization` header.
- Roles: `admin`, `supplier`, `customer`.
- Error responses are JSON with a `message` field.
