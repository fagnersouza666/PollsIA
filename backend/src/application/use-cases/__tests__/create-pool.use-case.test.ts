import 'reflect-metadata';
import { CreatePoolUseCase } from '../create-pool.use-case';
import { CreatePoolCommand } from '../../commands/create-pool.command';
import { Pool } from '../../../domain/entities/pool.entity';
import { IPoolRepository } from '../../../domain/repositories/pool.repository';
import { Logger } from '../../../shared/interfaces/logger.interface';
import { ValidationError, ConflictError } from '../../../shared/errors/domain.errors';
import { Result } from '../../../shared/result';

describe('CreatePoolUseCase', () => {
    let useCase: CreatePoolUseCase;
    let mockPoolRepository: jest.Mocked<IPoolRepository>;
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

        useCase = new CreatePoolUseCase(mockPoolRepository, mockLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should create a pool successfully', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'USDC',
                0.003,
                100,
                'SOL/USDC Pool',
                'So11111111111111111111111111111111111111112'
            );

            const poolResult = Pool.create({
                tokenA: command.tokenA,
                tokenB: command.tokenB,
                fee: command.fee,
                initialPrice: command.initialPrice,
                name: command.name,
                address: command.address,
            });

            expect(poolResult.isSuccess).toBe(true);
            const pool = poolResult.getValue();

            mockPoolRepository.findByAddress.mockResolvedValue(Result.ok(null));
            mockPoolRepository.save.mockResolvedValue(Result.ok(pool));

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(pool);
            expect(mockPoolRepository.findByAddress).toHaveBeenCalledWith(command.address);
            expect(mockPoolRepository.save).toHaveBeenCalledWith(expect.any(Pool));
            expect(mockLogger.info).toHaveBeenCalledWith('Creating pool', {
                tokenA: command.tokenA,
                tokenB: command.tokenB,
                fee: command.fee,
            });
        });

        it('should return validation error for invalid command', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                '', // Invalid tokenA
                'USDC',
                0.003,
                100
            );

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBeInstanceOf(ValidationError);
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should return conflict error when pool already exists', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'USDC',
                0.003,
                100,
                'SOL/USDC Pool',
                'So11111111111111111111111111111111111111112'
            );

            const existingPool = Pool.create({
                tokenA: 'SOL',
                tokenB: 'USDC',
                fee: 0.003,
                initialPrice: 100,
            }).getValue();

            mockPoolRepository.findByAddress.mockResolvedValue(Result.ok(existingPool));

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBeInstanceOf(ConflictError);
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith('Pool already exists', {
                address: command.address,
            });
        });

        it('should handle repository errors', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'USDC',
                0.003,
                100,
                'SOL/USDC Pool',
                'So11111111111111111111111111111111111111112'
            );

            mockPoolRepository.findByAddress.mockRejectedValue(new Error('Database error'));

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError().message).toBe('Database error');
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it('should validate same token error', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'SOL', // Same token
                0.003,
                100
            );

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBeInstanceOf(ValidationError);
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
        });

        it('should validate negative fee error', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'USDC',
                -0.1, // Negative fee
                100
            );

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBeInstanceOf(ValidationError);
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
        });

        it('should validate zero initial price error', async () => {
            // Arrange
            const command = new CreatePoolCommand(
                'SOL',
                'USDC',
                0.003,
                0 // Zero initial price
            );

            // Act
            const result = await useCase.execute(command);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBeInstanceOf(ValidationError);
            expect(mockPoolRepository.save).not.toHaveBeenCalled();
        });
    });
}); 