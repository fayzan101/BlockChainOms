const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { z } = require('zod');
const { createReviewSchema, idParamSchema } = require('../validators/reviewValidators');

const router = express.Router();
const productIdParam = z.object({ productId: z.coerce.number().int().positive() });

router.get('/product/:productId', validate(productIdParam, 'params'), reviewController.getProductReviews);
router.post('/', authMiddleware, roleCheck(['customer']), validate(createReviewSchema), reviewController.createReview);
router.delete('/:id', authMiddleware, validate(idParamSchema, 'params'), reviewController.deleteReview);

module.exports = router;
