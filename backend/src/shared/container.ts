import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Interfaces
import { Logger } from './interfaces/logger.interface';
import { PoolRepository } from '../domain/repositories/pool.repository';

// Implementations
import { WinstonLogger } from '../infrastructure/config/logger';
import { MockPoolRepository } from '../infrastructure/repositories/mock-pool.repository';

// Use cases
import { CreatePoolUseCase } from '../application/use-cases/create-pool.use-case';
import { GetPoolsUseCase } from '../application/use-cases/get-pools.use-case';

// Controllers
import { PoolController } from '../presentation/controllers/pool.controller';

const container = new Container();

// Infrastructure
container.bind<Logger>(TYPES.Logger).to(WinstonLogger).inSingletonScope();
container.bind<PoolRepository>(TYPES.PoolRepository).to(MockPoolRepository).inSingletonScope();

// Use Cases
container.bind<CreatePoolUseCase>(TYPES.CreatePoolUseCase).to(CreatePoolUseCase);
container.bind<GetPoolsUseCase>(TYPES.GetPoolsUseCase).to(GetPoolsUseCase);

// Controllers
container.bind<PoolController>(TYPES.PoolController).to(PoolController);

export { container };