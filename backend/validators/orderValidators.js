const { z } = require('zod');

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const createOrderSchema = z.object({
  item: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  userId: z.number().int().positive().optional(),
});

const updateOrderSchema = z.object({
  item: z.string().min(1).max(200).optional(),
  quantity: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  idParamSchema,
  ORDER_STATUSES,
  VALID_TRANSITIONS,
};
