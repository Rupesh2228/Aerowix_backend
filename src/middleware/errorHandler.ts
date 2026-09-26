import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const databaseError = [
    'ECONNREFUSED',
    'ENOTFOUND',
    '28P01',
    '3D000',
  ].includes(err.code) || /database|connect\\s+econnrefused|postgres/i.test(err.message || '');
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || (databaseError
      ? 'The database is unavailable. Start PostgreSQL and verify DATABASE_URL, then try again.'
      : 'Something went wrong on our end. Please try again.'),
  });
}
