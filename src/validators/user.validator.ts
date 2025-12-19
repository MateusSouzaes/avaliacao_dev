import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  active: z.boolean().optional(),
});

// Novo Schema para atualização da role permissão: Admin only
export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'user', 'viewer']),
});

