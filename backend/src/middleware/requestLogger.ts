import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';

// Extend Request interface to include timing
interface TimedRequest extends Request {
  startTime?: number;
  traceId?: string;
}

// Request logger middleware
export const requestLogger = (req: TimedRequest, res: Response, next: NextFunction): void => {
  // Generate trace ID for request tracking
  const traceId = req.headers['x-trace-id'] as string || uuidv4();
  req.traceId = traceId;
  
  // Set trace ID in response headers
  res.setHeader('x-trace-id', traceId);
  
  // Record start time
  req.startTime = Date.now();
  
  // Log request details
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    traceId,
    body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' 
      ? sanitizeRequestBody(req.body) 
      : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
  };
  
  Logger.http('Incoming Request', requestData);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;
    
    // Log response
    Logger.logRequest(req, res, responseTime);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

// Sanitize request body to remove sensitive information
const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sensitiveFields = [
    'password',
    'passwordConfirm',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secretKey',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurityNumber'
  ];
  
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Performance monitoring middleware
export const performanceLogger = (req: TimedRequest, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    Logger.logPerformanceMetric('http_request_duration', duration, 'ms', {
      method: req.method,
      route: req.route?.path || req.url,
      statusCode: res.statusCode,
      traceId: req.traceId
    });
    
    // Log slow requests
    if (duration > 1000) { // > 1 second
      Logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        traceId: req.traceId,
        userId: (req as any).user?.id
      });
    }
  });
  
  next();
}; 