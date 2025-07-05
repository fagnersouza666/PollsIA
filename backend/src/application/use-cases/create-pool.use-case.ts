import { injectable, inject } from 'inversify';
import { Result } from '../../shared/result';
import { Pool } from '../../domain/entities/pool.entity';
import { IPoolRepository } from '../../domain/repositories/pool.repository';
import { CreatePoolCommand } from '../commands/create-pool.command';
import { TYPES } from '../../shared/types';
import { ILogger } from '../../shared/interfaces/logger.interface';
import { DomainError } from '../../shared/errors/domain.errors';

export interface ICreatePoolUseCase {
  execute(command: CreatePoolCommand): Promise<Result<Pool, DomainError>>;
}

@injectable()
export class CreatePoolUseCase implements ICreatePoolUseCase {
  constructor(
    @inject(TYPES.PoolRepository) private poolRepository: IPoolRepository,
    @inject(TYPES.Logger) private logger: ILogger
  ) { }

  async execute(command: CreatePoolCommand): Promise<Result<Pool, DomainError>> {
    try {
      this.logger.info('Creating new pool', { command });

      // Validate command
      const validationResult = this.validateCommand(command);
      if (validationResult.isFailure) {
        return validationResult;
      }

      // Create pool entity
      const poolResult = Pool.create({
        tokenA: command.tokenA,
        tokenB: command.tokenB,
        fee: command.fee,
        initialPrice: command.initialPrice
      });

      if (poolResult.isFailure) {
        this.logger.error('Failed to create pool entity', { error: poolResult.getError() });
        return poolResult;
      }

      const pool = poolResult.getValue();

      // Save pool
      const saveResult = await this.poolRepository.save(pool);
      if (saveResult.isFailure) {
        this.logger.error('Failed to save pool', { error: saveResult.getError() });
        return saveResult;
      }

      this.logger.info('Pool created successfully', { poolId: pool.id });
      return Result.ok(pool);

    } catch (error) {
      this.logger.error('Unexpected error creating pool', { error });
      return Result.fail(new DomainError('POOL_CREATION_FAILED', 'Failed to create pool'));
    }
  }

  private validateCommand(command: CreatePoolCommand): Result<void, DomainError> {
    if (!command.tokenA || !command.tokenB) {
      return Result.fail(new DomainError('INVALID_TOKENS', 'Both tokenA and tokenB are required'));
    }

    if (command.tokenA === command.tokenB) {
      return Result.fail(new DomainError('SAME_TOKENS', 'TokenA and TokenB cannot be the same'));
    }

    if (command.fee < 0 || command.fee > 1) {
      return Result.fail(new DomainError('INVALID_FEE', 'Fee must be between 0 and 1'));
    }

    if (command.initialPrice <= 0) {
      return Result.fail(new DomainError('INVALID_PRICE', 'Initial price must be greater than 0'));
    }

    return Result.ok();
  }
}