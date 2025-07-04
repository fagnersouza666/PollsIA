export const TYPES = {
  // Services
  PoolService: Symbol.for('PoolService'),
  AnalyticsService: Symbol.for('AnalyticsService'),
  InvestmentService: Symbol.for('InvestmentService'),
  WalletService: Symbol.for('WalletService'),
  RaydiumInvestmentService: Symbol.for('RaydiumInvestmentService'),
  AutoRebalanceService: Symbol.for('AutoRebalanceService'),
  OneClickOptimizerService: Symbol.for('OneClickOptimizerService'),
  RiskManagementService: Symbol.for('RiskManagementService'),
  
  // Repositories
  PoolRepository: Symbol.for('PoolRepository'),
  WalletRepository: Symbol.for('WalletRepository'),
  AnalyticsRepository: Symbol.for('AnalyticsRepository'),
  
  // Use Cases
  CreatePoolUseCase: Symbol.for('CreatePoolUseCase'),
  GetPoolsUseCase: Symbol.for('GetPoolsUseCase'),
  
  // Infrastructure
  Logger: Symbol.for('Logger'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  RedisCache: Symbol.for('RedisCache'),
  SupabaseClient: Symbol.for('SupabaseClient'),
  
  // Controllers
  PoolController: Symbol.for('PoolController'),
  AnalyticsController: Symbol.for('AnalyticsController'),
  InvestmentController: Symbol.for('InvestmentController'),
  WalletController: Symbol.for('WalletController'),
  OptimizationController: Symbol.for('OptimizationController'),
} as const;