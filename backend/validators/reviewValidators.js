const { z } = require('zod');

const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { createReviewSchema, idParamSchema };
