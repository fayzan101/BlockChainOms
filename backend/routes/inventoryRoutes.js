const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { adjustStockSchema } = require('../validators/inventoryValidators');

const router = express.Router();

router.use(authMiddleware, roleCheck(['admin', 'supplier']));

router.get('/summary', inventoryController.getInventorySummary);
router.get('/movements', inventoryController.getStockMovements);
router.post('/adjust', validate(adjustStockSchema), inventoryController.adjustStock);

module.exports = router;
