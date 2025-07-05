import { BaseError } from './base.error';

export class DomainError extends BaseError {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'DomainError';
  }

  get statusCode(): number {
    return 400;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly violations: string[]) {
    super('VALIDATION_ERROR', message, violations);
    this.name = 'ValidationError';
  }

  get statusCode(): number {
    return 400;
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, identifier: string) {
    super('NOT_FOUND', `${resource} with identifier ${identifier} not found`);
    this.name = 'NotFoundError';
  }

  get statusCode(): number {
    return 404;
  }
}

export class ConflictError extends DomainError {
  constructor(resource: string, reason: string) {
    super('CONFLICT', `${resource} conflict: ${reason}`);
    this.name = 'ConflictError';
  }

  get statusCode(): number {
    return 409;
  }
}

export class BusinessRuleError extends DomainError {
  constructor(rule: string, message: string) {
    super('BUSINESS_RULE_VIOLATION', message, { rule });
    this.name = 'BusinessRuleError';
  }

  get statusCode(): number {
    return 422;
  }
}

export class InvariantError extends DomainError {
  constructor(invariant: string, message: string) {
    super('INVARIANT_VIOLATION', message, { invariant });
    this.name = 'InvariantError';
  }

  get statusCode(): number {
    return 500;
  }
}

export class PoolNotFoundError extends BaseError {
  readonly code = 'POOL_NOT_FOUND';
  readonly statusCode = 404;

  constructor(poolAddress: string) {
    super(`Pool not found: ${poolAddress}`, { poolAddress });
  }
}

export class WalletNotFoundError extends BaseError {
  readonly code = 'WALLET_NOT_FOUND';
  readonly statusCode = 404;

  constructor(publicKey: string) {
    super(`Wallet not found: ${publicKey}`, { publicKey });
  }
}

export class InsufficientFundsError extends BaseError {
  readonly code = 'INSUFFICIENT_FUNDS';
  readonly statusCode = 400;

  constructor(required: number, available: number, token: string) {
    super(`Insufficient funds: required ${required} ${token}, available ${available} ${token}`, {
      required,
      available,
      token,
    });
  }
}

export class InvalidPoolAddressError extends BaseError {
  readonly code = 'INVALID_POOL_ADDRESS';
  readonly statusCode = 400;

  constructor(address: string) {
    super(`Invalid pool address format: ${address}`, { address });
  }
}

export class InvalidWalletAddressError extends BaseError {
  readonly code = 'INVALID_WALLET_ADDRESS';
  readonly statusCode = 400;

  constructor(address: string) {
    super(`Invalid wallet address format: ${address}`, { address });
  }
}

export class PoolAlreadyExistsError extends BaseError {
  readonly code = 'POOL_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(poolAddress: string) {
    super(`Pool already exists: ${poolAddress}`, { poolAddress });
  }
}

export class InvestmentNotFoundError extends BaseError {
  readonly code = 'INVESTMENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(investmentId: string) {
    super(`Investment not found: ${investmentId}`, { investmentId });
  }
}

export class InvalidAmountError extends BaseError {
  readonly code = 'INVALID_AMOUNT';
  readonly statusCode = 400;

  constructor(amount: number, reason: string) {
    super(`Invalid amount: ${amount} - ${reason}`, { amount, reason });
  }
}

export class PositionNotFoundError extends BaseError {
  readonly code = 'POSITION_NOT_FOUND';
  readonly statusCode = 404;

  constructor(positionId: string) {
    super(`Position not found: ${positionId}`, { positionId });
  }
}