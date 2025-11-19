import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

