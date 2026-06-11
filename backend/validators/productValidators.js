const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0).optional().default(0),
  categoryId: z.number().int().positive().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  stock_quantity: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
});

module.exports = { createProductSchema, updateProductSchema, idParamSchema, searchQuerySchema };
