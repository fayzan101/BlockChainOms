const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { createCategorySchema, updateCategorySchema, idParamSchema };
