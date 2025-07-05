import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Interfaces
import { ILogger } from './interfaces/logger.interface';
import { IPoolRepository } from '../domain/repositories/pool.repository';
import { ICreatePoolUseCase } from '../application/use-cases/create-pool.use-case';
import { IGetPoolsUseCase } from '../application/use-cases/get-pools.use-case';

// Implementations
import { Logger } from '../infrastructure/config/logger';
import { MockPoolRepository } from '../infrastructure/repositories/mock-pool.repository';
import { CreatePoolUseCase } from '../application/use-cases/create-pool.use-case';
import { GetPoolsUseCase } from '../application/use-cases/get-pools.use-case';

// Controllers
import { PoolController } from '../presentation/controllers/pool.controller';

const container = new Container();

// Infrastructure
container.bind<ILogger>(TYPES.Logger).to(Logger).inSingletonScope();
container.bind<IPoolRepository>(TYPES.PoolRepository).to(MockPoolRepository).inSingletonScope();

// Application
container.bind<ICreatePoolUseCase>(TYPES.CreatePoolUseCase).to(CreatePoolUseCase);
container.bind<IGetPoolsUseCase>(TYPES.GetPoolsUseCase).to(GetPoolsUseCase);

// Controllers
container.bind<PoolController>(TYPES.PoolController).to(PoolController);

export { container };