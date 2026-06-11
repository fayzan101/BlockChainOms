const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createOrderSchema, updateOrderSchema, idParamSchema } = require('../validators/orderValidators');

const router = express.Router();

router.use(authMiddleware);

router.get('/my', roleCheck(['customer', 'admin']), orderController.getMyOrders);

function cancelBody(req, res, next) {
  req.body = { status: 'cancelled' };
  next();
}

router.post(
  '/:id/cancel',
  roleCheck(['admin', 'customer', 'supplier']),
  validate(idParamSchema, 'params'),
  cancelBody,
  validate(updateOrderSchema),
  orderController.updateOrder,
);
router.get('/', roleCheck(['admin', 'supplier', 'customer']), orderController.getOrders);
router.post('/', roleCheck(['admin', 'customer']), validate(createOrderSchema), orderController.createOrder);
router.get('/:id/verify', roleCheck(['admin', 'supplier', 'customer']), validate(idParamSchema, 'params'), orderController.verifyOrder);
router.get('/:id', roleCheck(['admin', 'supplier', 'customer']), validate(idParamSchema, 'params'), orderController.getOrderById);
router.put(
  '/:id',
  roleCheck(['admin', 'customer', 'supplier']),
  validate(idParamSchema, 'params'),
  validate(updateOrderSchema),
  orderController.updateOrder,
);
router.delete('/:id', roleCheck(['admin']), validate(idParamSchema, 'params'), orderController.deleteOrder);

module.exports = router;
