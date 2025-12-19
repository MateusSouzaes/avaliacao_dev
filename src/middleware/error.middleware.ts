import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isProd = process.env.NODE_ENV === 'production';

  console.error(err);

  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const payload: { error: string; stack?: string } = {
    error: isProd ? 'Internal server error' : err.message,
  };

  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

