const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  searchQuerySchema,
} = require('../validators/productValidators');

router.get('/search', validate(searchQuerySchema, 'query'), productController.searchProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/', productController.getProducts);
router.get('/:id', validate(idParamSchema, 'params'), productController.getProductById);

router.post(
  '/',
  authMiddleware,
  roleCheck(['admin', 'supplier']),
  validate(createProductSchema),
  productController.createProduct,
);

router.put(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'supplier']),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  '/:id',
  authMiddleware,
  roleCheck(['admin', 'supplier']),
  validate(idParamSchema, 'params'),
  productController.deleteProduct,
);

module.exports = router;
