export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  [key: string]: any;
}