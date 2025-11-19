import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number(),
  groupId: z.number().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  stock: z.number().optional(),
  groupId: z.number().optional(),
});

