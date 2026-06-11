const { z } = require('zod');

const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(100).default('US'),
  isDefault: z.boolean().optional().default(false),
});

const updateAddressSchema = createAddressSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: 'At least one field is required' },
);

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

module.exports = { createAddressSchema, updateAddressSchema, idParamSchema };
