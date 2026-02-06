const express = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();


function roleCheck(roles) {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}




router.get('/', authMiddleware, roleCheck(['admin', 'supplier', 'customer']), orderController.getOrders);
router.get('/:id', authMiddleware, roleCheck(['admin', 'supplier', 'customer']), orderController.getOrderById);
router.post('/', authMiddleware, roleCheck(['admin', 'customer']), orderController.createOrder);
router.put('/:id', authMiddleware, roleCheck(['admin', 'customer']), orderController.updateOrder);
router.delete('/:id', authMiddleware, roleCheck(['admin']), orderController.deleteOrder);


router.get('/:id/verify', authMiddleware, roleCheck(['admin', 'supplier', 'customer']), orderController.verifyOrder);

module.exports = router;