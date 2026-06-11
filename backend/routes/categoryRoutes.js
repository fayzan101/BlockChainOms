const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id/products', validate(idParamSchema, 'params'), categoryController.getCategoryProducts);
router.get('/:id', validate(idParamSchema, 'params'), categoryController.getCategoryById);

router.post('/', authMiddleware, roleCheck(['admin']), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authMiddleware, roleCheck(['admin']), validate(idParamSchema, 'params'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authMiddleware, roleCheck(['admin']), validate(idParamSchema, 'params'), categoryController.deleteCategory);

module.exports = router;
