import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';
import { Result } from '../../shared/result';
import { Logger } from '../../shared/interfaces/logger.interface';
import { PoolRepository } from '../../domain/repositories/pool.repository';
import { Pool } from '../../domain/entities/pool.entity';
import { CreatePoolCommand } from '../commands/create-pool.command';
import { 
  PoolAlreadyExistsError, 
  ValidationError,
  InternalServerError 
} from '../../shared/errors';

@injectable()
export class CreatePoolUseCase {
  constructor(
    @inject(TYPES.PoolRepository) private poolRepository: PoolRepository,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async execute(command: CreatePoolCommand): Promise<Result<Pool, Error>> {
    this.logger.info('Creating new pool', {
      address: command.address,
      name: command.name,
      tokenA: command.tokenAAddress,
      tokenB: command.tokenBAddress,
    });

    try {
      // Validate command
      if (!command.isValid()) {
        const errors = command.validate();
        this.logger.warn('Pool creation validation failed', { errors });
        return Result.failure(new ValidationError('Invalid pool data', { errors }));
      }

      // Check if pool already exists
      const existingPool = await this.poolRepository.findByAddress(command.address);
      if (existingPool) {
        this.logger.warn('Pool already exists', { address: command.address });
        return Result.failure(new PoolAlreadyExistsError(command.address));
      }

      // Check for existing pool with same token pair
      const existingPairs = await this.poolRepository.findByTokenPair(
        command.tokenAAddress,
        command.tokenBAddress
      );
      if (existingPairs.length > 0) {
        this.logger.warn('Pool with same token pair already exists', {
          tokenA: command.tokenAAddress,
          tokenB: command.tokenBAddress,
          existingPools: existingPairs.map(p => p.address),
        });
      }

      // Create pool entity
      const pool = Pool.create({
        address: command.address,
        name: command.name,
        tokenAAddress: command.tokenAAddress,
        tokenBAddress: command.tokenBAddress,
        liquidity: command.initialLiquidityA + command.initialLiquidityB,
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        tvl: command.initialLiquidityA + command.initialLiquidityB, // Simplified calculation
        price: command.initialLiquidityB / command.initialLiquidityA,
        priceChange24h: 0,
        isActive: true,
      });

      // Save pool
      const savedPool = await this.poolRepository.save(pool);

      this.logger.info('Pool created successfully', {
        poolId: savedPool.id,
        address: savedPool.address,
        name: savedPool.name,
        tvl: savedPool.tvl,
      });

      return Result.success(savedPool);

    } catch (error) {
      this.logger.error('Failed to create pool', error as Error);
      return Result.failure(new InternalServerError('Failed to create pool'));
    }
  }
}