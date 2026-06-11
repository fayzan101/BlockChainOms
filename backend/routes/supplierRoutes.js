const express = require('express');
const supplierController = require('../controllers/supplierController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../validators/productValidators');

const router = express.Router();

router.use(authMiddleware, roleCheck(['supplier', 'admin']));

router.get('/dashboard', supplierController.getDashboard);
router.get('/products', supplierController.getMyProducts);
router.get('/orders', supplierController.getMyOrders);
router.get('/products/:id/sales', validate(idParamSchema, 'params'), supplierController.getProductSales);

module.exports = router;
