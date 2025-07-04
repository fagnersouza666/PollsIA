import winston from 'winston';
import { injectable } from 'inversify';
import { Logger } from '../../shared/interfaces/logger.interface';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'pollsia-backend',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat,
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  winstonLogger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }));
  
  winstonLogger.add(new winston.transports.File({
    filename: 'logs/combined.log',
  }));
}

@injectable()
export class WinstonLogger implements Logger {
  info(message: string, meta?: any): void {
    winstonLogger.info(message, meta);
  }

  error(message: string, error?: Error): void {
    winstonLogger.error(message, { 
      error: error?.message,
      stack: error?.stack,
    });
  }

  warn(message: string, meta?: any): void {
    winstonLogger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    winstonLogger.debug(message, meta);
  }
}