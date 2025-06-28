import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@/models/User.model';
import { AuthenticationError, AuthorizationError } from '@/middleware/errorHandler';
import { cacheService, CACHE_KEYS } from '@/config/redis';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
  };
}

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token');
      } else {
        throw new AuthenticationError('Token verification failed');
      }
    }

    // Check if user exists and is active
    const cachedUser = await cacheService.get(CACHE_KEYS.USER(decoded.id));
    let user;

    if (cachedUser) {
      user = cachedUser;
    } else {
      user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      
      // Cache user for future requests
      await cacheService.set(CACHE_KEYS.USER(decoded.id), user, 1800); // 30 minutes
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions
    };

    logger.debug('User authenticated successfully', {
      userId: decoded.id,
      role: decoded.role,
      traceId: req.headers['x-trace-id']
    });

    next();
  } catch (error) {
    logger.error('Authentication failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      traceId: req.headers['x-trace-id']
    });
    next(error);
  }
};

/**
 * Authorization middleware - checks user permissions
 */
export const authorize = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const userPermissions = req.user.permissions;

      // Super admin has all permissions
      if (userPermissions.includes('*')) {
        return next();
      }

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn('Access denied - insufficient permissions', {
          userId: req.user.id,
          userPermissions,
          requiredPermissions,
          traceId: req.headers['x-trace-id']
        });
        throw new AuthorizationError('Insufficient permissions');
      }

      logger.debug('User authorized successfully', {
        userId: req.user.id,
        requiredPermissions,
        traceId: req.headers['x-trace-id']
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      if (!roles.includes(req.user.role)) {
        logger.warn('Access denied - insufficient role', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
          traceId: req.headers['x-trace-id']
        });
        throw new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return next(); // Continue without authentication
    }

    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JWTPayload;
      
      // Get user from cache or database
      const cachedUser = await cacheService.get(CACHE_KEYS.USER(decoded.id));
      let user;

      if (cachedUser) {
        user = cachedUser;
      } else {
        user = await User.findById(decoded.id).select('-password');
        if (user && user.status === 'active') {
          await cacheService.set(CACHE_KEYS.USER(decoded.id), user, 1800);
        }
      }

      if (user && user.status === 'active') {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions
        };
      }
    } catch (error) {
      // Ignore token errors for optional auth
      logger.debug('Optional auth failed, continuing without authentication', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Owner authorization - checks if user owns the resource
 */
export const requireOwnership = (resourceIdParam: string = 'id', ownerField: string = 'createdBy') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new AuthorizationError('Resource ID not provided');
      }

      // This is a generic check - in practice, you'd check specific models
      // For now, we'll assume the service layer handles ownership checks
      // TODO: Implement specific ownership checks based on resource type

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * API Key authentication middleware (for external integrations)
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new AuthenticationError('API key is required');
    }

    // TODO: Implement API key validation logic
    // For now, this is a placeholder
    
    logger.debug('API key authentication attempted', {
      apiKey: apiKey.substring(0, 8) + '...',
      traceId: req.headers['x-trace-id']
    });

    // Attach API client info to request if valid
    (req as any).apiClient = {
      id: 'placeholder-client-id',
      name: 'External Integration',
      permissions: ['api.access']
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting per user
 */
export const userRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(); // Skip rate limiting for unauthenticated requests
      }

      const key = `rate_limit:user:${req.user.id}`;
      const current = await cacheService.increment(key);

      if (current === 1) {
        // First request in window, set expiration
        await cacheService.expire(key, Math.floor(windowMs / 1000));
      }

      if (current > maxRequests) {
        logger.warn('User rate limit exceeded', {
          userId: req.user.id,
          current,
          maxRequests,
          traceId: req.headers['x-trace-id']
        });
        
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.floor(windowMs / 1000)
        });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next(); // Continue on rate limit errors
    }
  };
}; 