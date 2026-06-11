/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Categories with product counts
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/categories/{id}:
 *   get:
 *     summary: Get category
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Category
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Deleted
 *
 * /api/categories/{id}/products:
 *   get:
 *     summary: Products in category
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Products
 *
 * /api/notifications:
 *   get:
 *     summary: List notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications
 *
 * /api/notifications/unread-count:
 *   get:
 *     summary: Unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count
 *
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated
 *
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Updated
 *
 * /api/inventory/summary:
 *   get:
 *     summary: Inventory summary
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock summary
 *
 * /api/inventory/movements:
 *   get:
 *     summary: Stock movement history
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Movements
 *
 * /api/inventory/adjust:
 *   post:
 *     summary: Manually adjust stock
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Adjusted
 *
 * /api/addresses:
 *   get:
 *     summary: List shipping addresses
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses
 *   post:
 *     summary: Add address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/addresses/{id}:
 *   get:
 *     summary: Get address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Address
 *   put:
 *     summary: Update address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Deleted
 *
 * /api/addresses/{id}/default:
 *   patch:
 *     summary: Set default address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Updated
 *
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Product reviews and rating stats
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reviews
 *
 * /api/reviews:
 *   post:
 *     summary: Create review (delivered orders only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Deleted
 *
 * /api/supplier/dashboard:
 *   get:
 *     summary: Supplier dashboard
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics
 *
 * /api/supplier/products:
 *   get:
 *     summary: Supplier's products
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products
 *
 * /api/supplier/orders:
 *   get:
 *     summary: Orders for supplier products
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders
 *
 * /api/supplier/products/{id}/sales:
 *   get:
 *     summary: Sales stats for a product
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Sales data
 *
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     description: Restores stock and notifies customer.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Cancelled
 */

module.exports = {};
