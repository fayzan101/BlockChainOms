const { z } = require('zod');

const adjustStockSchema = z.object({
  productId: z.number().int().positive(),
  change: z.number().int().refine((n) => n !== 0, { message: 'Change cannot be zero' }),
  note: z.string().max(500).optional(),
});

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { adjustStockSchema, idParamSchema };
