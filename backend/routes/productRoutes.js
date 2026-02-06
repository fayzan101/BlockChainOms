const express = require('express');
const router = express.Router();
const { createProduct, getProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');


function roleCheck(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

router.post('/', authMiddleware, roleCheck(['admin', 'supplier']), createProduct);
router.get('/', getProducts);
router.put('/:id', authMiddleware, roleCheck(['admin', 'supplier']), updateProduct);
router.delete('/:id', authMiddleware, roleCheck(['admin', 'supplier']), deleteProduct);

module.exports = router;
