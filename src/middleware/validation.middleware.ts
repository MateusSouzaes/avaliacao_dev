import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ path: e.path, message: e.message })),
        });
      }
      next(error);
    }
  };
};

