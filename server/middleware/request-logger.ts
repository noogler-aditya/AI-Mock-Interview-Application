import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Log request body in development
  if (process.env.NODE_ENV === 'development' && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }

  // Log response details after request is complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};