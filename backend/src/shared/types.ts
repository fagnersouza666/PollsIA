/**
 * @fileoverview Dependency Injection Types
 * @description Symbols for InversifyJS container binding
 * @author PollsIA Team
 * @version 1.0.0
 */

export const TYPES = {
  // Infrastructure
  Logger: Symbol.for('Logger'),
  Database: Symbol.for('Database'),
  Redis: Symbol.for('Redis'),
  Config: Symbol.for('Config'),

  // Repositories
  PoolRepository: Symbol.for('PoolRepository'),
  UserRepository: Symbol.for('UserRepository'),
  TransactionRepository: Symbol.for('TransactionRepository'),

  // Use Cases
  CreatePoolUseCase: Symbol.for('CreatePoolUseCase'),
  GetPoolsUseCase: Symbol.for('GetPoolsUseCase'),
  UpdatePoolUseCase: Symbol.for('UpdatePoolUseCase'),
  DeletePoolUseCase: Symbol.for('DeletePoolUseCase'),

  // Controllers
  PoolController: Symbol.for('PoolController'),

  // Services
  WalletService: Symbol.for('WalletService'),
  BlockchainService: Symbol.for('BlockchainService'),
  PriceService: Symbol.for('PriceService'),
  NotificationService: Symbol.for('NotificationService'),

  // External Services
  SolanaConnection: Symbol.for('SolanaConnection'),
  RedisClient: Symbol.for('RedisClient'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),

  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  SecurityMiddleware: Symbol.for('SecurityMiddleware'),
  LoggingMiddleware: Symbol.for('LoggingMiddleware'),
  RateLimitMiddleware: Symbol.for('RateLimitMiddleware'),

  // Validators
  PoolValidator: Symbol.for('PoolValidator'),
  UserValidator: Symbol.for('UserValidator'),
  TransactionValidator: Symbol.for('TransactionValidator'),

  // Event Handlers
  PoolCreatedHandler: Symbol.for('PoolCreatedHandler'),
  PoolUpdatedHandler: Symbol.for('PoolUpdatedHandler'),
  PoolDeletedHandler: Symbol.for('PoolDeletedHandler'),

  // Factories
  PoolFactory: Symbol.for('PoolFactory'),
  TransactionFactory: Symbol.for('TransactionFactory'),
  ResponseFactory: Symbol.for('ResponseFactory'),
} as const;

/**
 * Type-safe keys for TYPES object
 */
export type TypeKeys = keyof typeof TYPES;

/**
 * Type-safe values for TYPES object
 */
export type TypeValues = typeof TYPES[TypeKeys];