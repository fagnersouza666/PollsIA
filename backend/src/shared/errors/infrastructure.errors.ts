import { BaseError } from './base.error';

export class DatabaseConnectionError extends BaseError {
  readonly code = 'DATABASE_CONNECTION_ERROR';
  readonly statusCode = 503;

  constructor(originalError: Error) {
    super('Database connection failed', { originalError: originalError.message });
  }
}

export class ExternalServiceError extends BaseError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;

  constructor(service: string, originalError: Error) {
    super(`External service error: ${service}`, {
      service,
      originalError: originalError.message
    });
  }
}

export class BlockchainConnectionError extends BaseError {
  readonly code = 'BLOCKCHAIN_CONNECTION_ERROR';
  readonly statusCode = 503;

  constructor(network: string, originalError: Error) {
    super(`Blockchain connection failed: ${network}`, {
      network,
      originalError: originalError.message,
    });
  }
}

export class TransactionFailedError extends BaseError {
  readonly code = 'TRANSACTION_FAILED';
  readonly statusCode = 500;

  constructor(transactionHash: string, reason: string) {
    super(`Transaction failed: ${transactionHash} - ${reason}`, {
      transactionHash,
      reason,
    });
  }
}

export class CacheError extends BaseError {
  readonly code = 'CACHE_ERROR';
  readonly statusCode = 503;

  constructor(operation: string, originalError: Error) {
    super(`Cache operation failed: ${operation}`, {
      operation,
      originalError: originalError.message,
    });
  }
}

export class ConfigurationError extends BaseError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly statusCode = 500;

  constructor(setting: string, reason: string) {
    super(`Configuration error: ${setting} - ${reason}`, {
      setting,
      reason,
    });
  }
}

export class InternalServerError extends BaseError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  readonly statusCode = 500;

  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}