/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           writeOnly: true
 *         role:
 *           type: string
 *           enum: [customer, supplier, admin]
 *           example: customer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [customer, supplier, admin]
 *           example: customer
 *
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *         role:
 *           type: string
 *           enum: [customer, supplier]
 *           default: customer
 *           example: customer
 *
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: John Updated
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *
 *     AdminCreateUserRequest:
 *       type: object
 *       required: [name, email, password, role]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [customer, supplier, admin]
 *
 *     AdminUpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         role:
 *           type: string
 *           enum: [customer, supplier, admin]
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: password123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT bearer token (expires in 1 day)
 *         role:
 *           type: string
 *           enum: [customer, supplier, admin]
 *           example: customer
 *         user:
 *           $ref: '#/components/schemas/UserPublic'
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User registered
 *         user:
 *           $ref: '#/components/schemas/UserPublic'
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Laptop
 *         description:
 *           type: string
 *           nullable: true
 *           example: High-performance laptop
 *         price:
 *           type: number
 *           format: float
 *           example: 999.99
 *         stock_quantity:
 *           type: integer
 *           example: 50
 *         createdBy:
 *           type: integer
 *           example: 2
 *
 *     CreateProductRequest:
 *       type: object
 *       required: [name, price]
 *       properties:
 *         name:
 *           type: string
 *           example: Laptop
 *         description:
 *           type: string
 *           example: High-performance laptop
 *         price:
 *           type: number
 *           format: float
 *           example: 999.99
 *         stock_quantity:
 *           type: integer
 *           default: 0
 *           example: 50
 *
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Laptop Pro
 *         description:
 *           type: string
 *           example: Updated high-performance laptop
 *         price:
 *           type: number
 *           format: float
 *           example: 1099.99
 *         stock_quantity:
 *           type: integer
 *           example: 45
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         item:
 *           type: string
 *           description: Product name (must match an existing product)
 *           example: Laptop
 *         quantity:
 *           type: integer
 *           example: 2
 *         userId:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           example: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     CreateOrderRequest:
 *       type: object
 *       required: [item, quantity]
 *       properties:
 *         item:
 *           type: string
 *           description: Product name (must exist in catalog)
 *           example: Laptop
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         userId:
 *           type: integer
 *           description: Admin only — assign order to another user
 *           example: 1
 *
 *     UpdateOrderRequest:
 *       type: object
 *       properties:
 *         item:
 *           type: string
 *           example: Laptop
 *         quantity:
 *           type: integer
 *           example: 3
 *         userId:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           description: >
 *             Status transitions: pending → confirmed/cancelled,
 *             confirmed → shipped/cancelled, shipped → delivered.
 *             Customers cannot change status.
 *           example: confirmed
 *
 *     OrderVerifyResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: integer
 *           example: 1
 *         dbHash:
 *           type: string
 *           example: "0xabc123..."
 *         blockchainHash:
 *           type: string
 *           example: "0xabc123..."
 *         verified:
 *           type: boolean
 *           example: true
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Deleted
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Error message
 *         error:
 *           type: string
 *           example: Detailed error description
 *
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         database:
 *           type: string
 *           enum: [connected, disconnected]
 *           example: connected
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         users:
 *           type: integer
 *         products:
 *           type: integer
 *         orders:
 *           type: integer
 *         ordersByStatus:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *         estimatedRevenue:
 *           type: number
 *         lowStockProducts:
 *           type: integer
 *         blockchainDemoMode:
 *           type: boolean
 *         recentOrders:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Order'
 *
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         order_id:
 *           type: integer
 *         action:
 *           type: string
 *         performed_by:
 *           type: integer
 *         old_hash:
 *           type: string
 *           nullable: true
 *         new_hash:
 *           type: string
 *         blockchain_tx_id:
 *           type: string
 *           nullable: true
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *   parameters:
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *
 *   responses:
 *     Unauthorized:
 *       description: Missing or invalid JWT token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: No token provided
 *     Forbidden:
 *       description: Insufficient permissions for this action
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             message: Forbidden
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

module.exports = {};
