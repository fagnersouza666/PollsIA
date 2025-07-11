import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Interfaces
import { Logger } from './interfaces/logger.interface';
import { IPoolRepository } from '../domain/repositories/pool.repository';
import { ICreatePoolUseCase } from '../application/use-cases/create-pool.use-case';
import { IGetPoolsUseCase } from '../application/use-cases/get-pools.use-case';

// Implementations
import { WinstonLogger } from '../infrastructure/config/logger';
import { MockPoolRepository } from '../infrastructure/repositories/mock-pool.repository';
import { CreatePoolUseCase } from '../application/use-cases/create-pool.use-case';
import { GetPoolsUseCase } from '../application/use-cases/get-pools.use-case';
import { WalletService } from '../services/WalletService';

// Controllers
import { PoolController } from '../presentation/controllers/pool.controller';
import { WalletController } from '../presentation/controllers/wallet.controller';

const container = new Container();

// Infrastructure
container.bind<Logger>(TYPES.Logger).to(WinstonLogger).inSingletonScope();

// Repositories
container.bind<IPoolRepository>(TYPES.PoolRepository).to(MockPoolRepository).inSingletonScope();

// Services
container.bind<WalletService>(TYPES.WalletService).to(WalletService).inSingletonScope();

// Application
container.bind<ICreatePoolUseCase>(TYPES.CreatePoolUseCase).to(CreatePoolUseCase);
container.bind<IGetPoolsUseCase>(TYPES.GetPoolsUseCase).to(GetPoolsUseCase);

// Controllers
container.bind<PoolController>(TYPES.PoolController).to(PoolController);
container.bind<WalletController>(TYPES.WalletController).to(WalletController);

export { container };