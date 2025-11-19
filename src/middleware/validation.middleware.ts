import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      // PROBLEMA INTENCIONAL: Não trata adequadamente erros de validação
      res.status(400).json({ error: 'Validation error' });
    }
  };
};

