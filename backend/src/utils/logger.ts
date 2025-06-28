import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which logs to display based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
      ),
    ),
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json(),
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json(),
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Stream for morgan middleware
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')));
  },
};

// Helper functions for structured logging
export class Logger {
  static error(message: string, meta?: any): void {
    logger.error(message, meta);
  }
  
  static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }
  
  static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }
  
  static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }
  
  static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }
  
  // Specialized logging methods
  static logRequest(req: any, res: any, responseTime: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id,
      traceId: req.headers['x-trace-id'],
    };
    
    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  }
  
  static logDatabaseOperation(operation: string, collection: string, duration: number, error?: Error): void {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      ...(error && { error: error.message }),
    };
    
    if (error) {
      logger.error('Database Operation Failed', logData);
    } else {
      logger.debug('Database Operation', logData);
    }
  }
  
  static logAIOperation(service: string, model: string, tokens: number, duration: number, error?: Error): void {
    const logData = {
      service,
      model,
      tokens,
      duration: `${duration}ms`,
      ...(error && { error: error.message }),
    };
    
    if (error) {
      logger.error('AI Service Operation Failed', logData);
    } else {
      logger.info('AI Service Operation', logData);
    }
  }
  
  static logBlockchainTransaction(
    txHash: string, 
    contractAddress: string, 
    method: string, 
    gasUsed: number, 
    error?: Error
  ): void {
    const logData = {
      txHash,
      contractAddress,
      method,
      gasUsed,
      ...(error && { error: error.message }),
    };
    
    if (error) {
      logger.error('Blockchain Transaction Failed', logData);
    } else {
      logger.info('Blockchain Transaction Success', logData);
    }
  }
  
  static logSecurityEvent(event: string, userId?: string, ip?: string, details?: any): void {
    const logData = {
      event,
      userId,
      ip,
      timestamp: new Date().toISOString(),
      ...details,
    };
    
    logger.warn('Security Event', logData);
  }
  
  static logPerformanceMetric(metric: string, value: number, unit: string, context?: any): void {
    const logData = {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      ...context,
    };
    
    logger.info('Performance Metric', logData);
  }
}

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
} 