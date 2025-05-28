import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle Firebase Auth errors
  if (err.name === 'FirebaseAuthError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }

  // Handle rate limit errors
  if (err.name === 'RateLimitExceeded') {
    return res.status(429).json({
      error: 'Too many requests',
      message: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};