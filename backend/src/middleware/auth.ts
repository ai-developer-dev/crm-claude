import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticateToken = (req: any, res: any, next: any) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired. Please login again.' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token.' 
        });
      }
    }
    
    return res.status(401).json({ 
      error: 'Token verification failed.' 
    });
  }
};

export const optionalAuth = (req: any, res: any, next: any) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // For optional auth, we don't return an error, just continue without user
    }
  }
  
  next();
};