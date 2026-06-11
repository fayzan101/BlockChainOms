const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['customer', 'supplier', 'admin']),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['customer', 'supplier', 'admin']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createUserSchema, updateUserSchema, idParamSchema };
