import 'reflect-metadata';
import { CreatePoolUseCase } from '../../../application/use-cases/create-pool.use-case';
import { CreatePoolCommand } from '../../../application/commands/create-pool.command';
import { Pool } from '../../../domain/entities/pool.entity';
import { PoolRepository } from '../../../domain/repositories/pool.repository';
import { Logger } from '../../../shared/interfaces/logger.interface';
import { 
  PoolAlreadyExistsError, 
  ValidationError,
  InternalServerError 
} from '../../../shared/errors';

describe('CreatePoolUseCase', () => {
  let createPoolUseCase: CreatePoolUseCase;
  let mockPoolRepository: jest.Mocked<PoolRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockPoolRepository = {
      findById: jest.fn(),
      findByAddress: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findHighPerformingPools: jest.fn(),
      findByTokenPair: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    createPoolUseCase = new CreatePoolUseCase(mockPoolRepository, mockLogger);
  });

  describe('execute', () => {
    const validCommand = new CreatePoolCommand(
      'PoolAddress123',
      'SOL/USDC Pool',
      'TokenA123',
      'TokenB456',
      1000,
      2000,
      0.003
    );

    it('should create pool successfully when data is valid and pool does not exist', async () => {
      // Arrange
      mockPoolRepository.findByAddress.mockResolvedValue(null);
      mockPoolRepository.findByTokenPair.mockResolvedValue([]);
      
      const savedPool = Pool.create({
        address: 'PoolAddress123',
        name: 'SOL/USDC Pool',
        tokenAAddress: 'TokenA123',
        tokenBAddress: 'TokenB456',
        liquidity: 3000,
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        tvl: 3000,
        price: 2,
        priceChange24h: 0,
        isActive: true,
      });
      
      mockPoolRepository.save.mockResolvedValue(savedPool);

      // Act
      const result = await createPoolUseCase.execute(validCommand);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value.address).toBe('PoolAddress123');
      expect(result.value.name).toBe('SOL/USDC Pool');
      
      expect(mockPoolRepository.findByAddress).toHaveBeenCalledWith('PoolAddress123');
      expect(mockPoolRepository.findByTokenPair).toHaveBeenCalledWith('TokenA123', 'TokenB456');
      expect(mockPoolRepository.save).toHaveBeenCalledWith(expect.any(Pool));
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating new pool',
        expect.objectContaining({
          address: 'PoolAddress123',
          name: 'SOL/USDC Pool',
        })
      );
    });

    it('should return failure when command is invalid', async () => {
      // Arrange
      const invalidCommand = new CreatePoolCommand(
        '', // Invalid empty address
        'SOL/USDC Pool',
        'TokenA123',
        'TokenB456',
        1000,
        2000,
        0.003
      );

      // Act
      const result = await createPoolUseCase.execute(invalidCommand);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('Invalid pool data');
      
      expect(mockPoolRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pool creation validation failed',
        expect.objectContaining({ errors: expect.any(Array) })
      );
    });

    it('should return failure when pool already exists', async () => {
      // Arrange
      const existingPool = Pool.create({
        address: 'PoolAddress123',
        name: 'Existing Pool',
        tokenAAddress: 'TokenA123',
        tokenBAddress: 'TokenB456',
        liquidity: 1000,
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        tvl: 1000,
        price: 1,
        priceChange24h: 0,
        isActive: true,
      });

      mockPoolRepository.findByAddress.mockResolvedValue(existingPool);

      // Act
      const result = await createPoolUseCase.execute(validCommand);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PoolAlreadyExistsError);
      expect(result.error.message).toContain('PoolAddress123');
      
      expect(mockPoolRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pool already exists',
        { address: 'PoolAddress123' }
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      mockPoolRepository.findByAddress.mockRejectedValue(unexpectedError);

      // Act
      const result = await createPoolUseCase.execute(validCommand);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InternalServerError);
      expect(result.error.message).toBe('Failed to create pool');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create pool',
        unexpectedError
      );
    });

    it('should warn when pool with same token pair already exists', async () => {
      // Arrange
      const existingPairPool = Pool.create({
        address: 'DifferentAddress',
        name: 'Different Pool',
        tokenAAddress: 'TokenA123',
        tokenBAddress: 'TokenB456',
        liquidity: 1000,
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        tvl: 1000,
        price: 1,
        priceChange24h: 0,
        isActive: true,
      });

      mockPoolRepository.findByAddress.mockResolvedValue(null);
      mockPoolRepository.findByTokenPair.mockResolvedValue([existingPairPool]);
      
      const savedPool = Pool.create({
        address: 'PoolAddress123',
        name: 'SOL/USDC Pool',
        tokenAAddress: 'TokenA123',
        tokenBAddress: 'TokenB456',
        liquidity: 3000,
        volume24h: 0,
        fees24h: 0,
        apr: 0,
        tvl: 3000,
        price: 2,
        priceChange24h: 0,
        isActive: true,
      });
      
      mockPoolRepository.save.mockResolvedValue(savedPool);

      // Act
      const result = await createPoolUseCase.execute(validCommand);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Pool with same token pair already exists',
        expect.objectContaining({
          tokenA: 'TokenA123',
          tokenB: 'TokenB456',
          existingPools: ['DifferentAddress'],
        })
      );
    });
  });
});