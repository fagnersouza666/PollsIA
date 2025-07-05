export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly _context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class ApiError extends BaseError {
  readonly statusCode: number;

  constructor(
    public readonly _code: string,
    message: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message, context);
    this.statusCode = statusCode;
  }

  get code(): string {
    return this._code;
  }
}

export class NetworkError extends BaseError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;
}

export class NotFoundError extends BaseError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

export class WalletConnectionError extends BaseError {
  readonly code = 'WALLET_CONNECTION_ERROR';
  readonly statusCode = 503;
}

export class TransactionError extends BaseError {
  readonly code = 'TRANSACTION_ERROR';
  readonly statusCode = 500;
}

export class PoolError extends BaseError {
  readonly code = 'POOL_ERROR';
  readonly statusCode = 500;
}

// Error utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (error instanceof BaseError) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};