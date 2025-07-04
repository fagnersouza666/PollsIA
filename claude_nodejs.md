# CLAUDE-NODEJS.md - Guia para Node.js

> **Para Claude Code**: Este documento define padrões específicos para Node.js. Sempre seguir estas diretrizes junto com CLAUDE.md.

## ⚡ TL;DR para Claude Code (Node.js)
```
SEMPRE:
✅ TypeScript strict mode
✅ Dependency injection com containers
✅ async/await, nunca callbacks
✅ Error-first com Result pattern
✅ Validation com Zod/Joi
✅ Structured logging (Winston/Pino)
✅ Environment configs
✅ Jest para testes + supertest

NUNCA:
❌ JavaScript puro (sempre TypeScript)
❌ require() direto (use injeção)
❌ Callbacks (use async/await)
❌ throw Error genérico
❌ Validação manual
❌ console.log (use logger)
❌ Hardcoded values
❌ Testes sem mocks apropriados
```

## Estrutura de Projeto Node.js

```
src/
├── domain/                    # Regras de negócio
│   ├── entities/
│   ├── repositories/          # Interfaces
│   ├── services/              # Interfaces
│   └── value-objects/
├── application/               # Casos de uso
│   ├── use-cases/
│   ├── commands/
│   ├── queries/
│   └── handlers/
├── infrastructure/            # Implementações técnicas
│   ├── database/
│   │   ├── repositories/
│   │   ├── migrations/
│   │   └── models/
│   ├── external/
│   ├── messaging/
│   └── config/
├── presentation/              # HTTP/API Layer
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── dto/
│   └── validators/
├── shared/                    # Utilitários compartilhados
│   ├── errors/
│   ├── utils/
│   ├── types/
│   └── constants/
└── main.ts                   # Entry point

tests/
├── unit/
├── integration/
└── e2e/

config/
├── database.ts
├── logger.ts
└── env.ts
```

## Zero Acoplamento com DI Container

### ✅ Container de Injeção de Dependência
```typescript
// src/shared/container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

// Interfaces
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

interface EmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  warn(message: string, meta?: any): void;
}

// Container setup
const container = new Container();

// Bind interfaces to implementations
container.bind<UserRepository>(TYPES.UserRepository).to(MongoUserRepository);
container.bind<EmailService>(TYPES.EmailService).to(SMTPEmailService);
container.bind<Logger>(TYPES.Logger).to(WinstonLogger);

export { container };

// src/shared/types.ts
export const TYPES = {
  UserRepository: Symbol.for('UserRepository'),
  EmailService: Symbol.for('EmailService'),
  Logger: Symbol.for('Logger'),
  UserService: Symbol.for('UserService'),
} as const;
```

### ✅ Serviço com DI
```typescript
// src/application/use-cases/create-user.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../shared/types';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.EmailService) private emailService: EmailService,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<User, Error>> {
    this.logger.info('Creating user', { email: command.email });

    try {
      // Validação de negócio
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        return Result.failure(new DuplicateEmailError(command.email));
      }

      // Criação da entidade
      const user = User.create({
        name: command.name,
        email: command.email,
      });

      // Persistência
      const savedUser = await this.userRepository.save(user);

      // Efeito colateral
      await this.emailService.sendWelcomeEmail(savedUser.email);

      this.logger.info('User created successfully', { 
        userId: savedUser.id,
        email: savedUser.email 
      });

      return Result.success(savedUser);

    } catch (error) {
      this.logger.error('Failed to create user', error as Error);
      return Result.failure(new InternalServerError('Failed to create user'));
    }
  }
}
```

### ❌ Padrão Incorreto - Alto Acoplamento
```typescript
// NUNCA FAÇA ISSO
export class UserService {
  private userRepository = new MongoUserRepository(); // ❌ Dependência concreta
  private emailService = new SMTPEmailService();     // ❌ Implementação específica

  async createUser(name: string, email: string) {
    // ❌ Sem validação adequada
    const user = new User(name, email);
    
    // ❌ Sem tratamento de erro
    await this.userRepository.save(user);
    
    // ❌ Sem logging estruturado
    console.log('User created'); // ❌ console.log
    
    return user;
  }
}
```

## Result Pattern para Error Handling

### Result Type
```typescript
// src/shared/result.ts
export class Result<T, E extends Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static failure<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value of a failure result');
    }
    return this._value!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error of a success result');
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success(fn(this._value!));
    }
    return Result.failure(this._error!);
  }

  mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.success(this._value!);
    }
    return Result.failure(fn(this._error!));
  }

  match<U>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => U
  ): U {
    if (this._isSuccess) {
      return onSuccess(this._value!);
    }
    return onFailure(this._error!);
  }
}
```

### Custom Error Hierarchy
```typescript
// src/shared/errors/base.error.ts
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// src/shared/errors/domain.errors.ts
export class DuplicateEmailError extends BaseError {
  readonly code = 'DUPLICATE_EMAIL';
  readonly statusCode = 409;

  constructor(email: string) {
    super(`Email already exists: ${email}`, { email });
  }
}

export class UserNotFoundError extends BaseError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(userId: string) {
    super(`User not found: ${userId}`, { userId });
  }
}

export class InvalidEmailError extends BaseError {
  readonly code = 'INVALID_EMAIL';
  readonly statusCode = 400;

  constructor(email: string) {
    super(`Invalid email format: ${email}`, { email });
  }
}

// src/shared/errors/infrastructure.errors.ts
export class DatabaseConnectionError extends BaseError {
  readonly code = 'DATABASE_CONNECTION_ERROR';
  readonly statusCode = 503;

  constructor(originalError: Error) {
    super('Database connection failed', { originalError: originalError.message });
  }
}

export class ExternalServiceError extends BaseError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;

  constructor(service: string, originalError: Error) {
    super(`External service error: ${service}`, { 
      service, 
      originalError: originalError.message 
    });
  }
}
```

## DTOs e Validação com Zod

### Request/Response DTOs
```typescript
// src/presentation/dto/user.dto.ts
import { z } from 'zod';

// Request schemas
export const CreateUserRequestSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  age: z.number()
    .int('Age must be an integer')
    .min(18, 'Age must be at least 18')
    .max(120, 'Age must not exceed 120')
    .optional(),
});

export const UpdateUserRequestSchema = CreateUserRequestSchema.partial();

export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().trim().optional(),
});

// Inferred types
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;

// Response schemas
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Mappers
export class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toCommand(request: CreateUserRequest): CreateUserCommand {
    return new CreateUserCommand(
      request.name,
      request.email,
      request.age
    );
  }
}
```

### Validation Middleware
```typescript
// src/presentation/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          errors: validationErrors,
          timestamp: new Date().toISOString(),
        });
      }
      
      next(error);
    }
  };
};
```

## Clean Controllers

### Controller com Error Handling
```typescript
// src/presentation/controllers/user.controller.ts
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const command = UserMapper.toCommand(req.body as CreateUserRequest);
    
    const result = await this.createUserUseCase.execute(command);
    
    result.match(
      (user) => {
        const response = UserMapper.toResponse(user);
        res.status(201).json({
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        this.handleError(res, error);
      }
    );
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const result = await this.getUserUseCase.execute(id);
    
    result.match(
      (user) => {
        const response = UserMapper.toResponse(user);
        res.json({
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        this.handleError(res, error);
      }
    );
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const query = req.query as GetUsersQuery;
    
    const result = await this.getUsersUseCase.execute(query);
    
    result.match(
      (paginatedUsers) => {
        res.json({
          success: true,
          data: paginatedUsers.items.map(UserMapper.toResponse),
          pagination: {
            page: paginatedUsers.page,
            limit: paginatedUsers.limit,
            total: paginatedUsers.total,
            totalPages: Math.ceil(paginatedUsers.total / paginatedUsers.limit),
          },
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        this.handleError(res, error);
      }
    );
  }

  private handleError(res: Response, error: Error): void {
    if (error instanceof BaseError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      this.logger.error('Unexpected error in controller', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
```

### Routes Setup
```typescript
// src/presentation/routes/user.routes.ts
import { Router } from 'express';
import { container } from '../../shared/container';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  GetUsersQuerySchema 
} from '../dto/user.dto';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

router.post(
  '/',
  validateRequest({ body: CreateUserRequestSchema }),
  userController.createUser.bind(userController)
);

router.get(
  '/:id',
  validateRequest({ 
    params: z.object({ id: z.string().uuid() })
  }),
  userController.getUserById.bind(userController)
);

router.get(
  '/',
  validateRequest({ query: GetUsersQuerySchema }),
  userController.getUsers.bind(userController)
);

router.put(
  '/:id',
  validateRequest({ 
    params: z.object({ id: z.string().uuid() }),
    body: UpdateUserRequestSchema 
  }),
  userController.updateUser.bind(userController)
);

export { router as userRoutes };
```

## Configuração e Environment

### Environment Configuration
```typescript
// src/infrastructure/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().default(10),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('1d'),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),
  
  // External APIs
  EXTERNAL_API_URL: z.string().url(),
  EXTERNAL_API_KEY: z.string(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Environment = z.infer<typeof envSchema>;

class ConfigService {
  private static instance: ConfigService;
  private config: Environment;

  private constructor() {
    try {
      this.config = envSchema.parse(process.env);
    } catch (error) {
      console.error('❌ Invalid environment configuration:', error);
      process.exit(1);
    }
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  get<K extends keyof Environment>(key: K): Environment[K] {
    return this.config[key];
  }

  getAll(): Environment {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}

export const config = ConfigService.getInstance();
```

### Database Configuration
```typescript
// src/infrastructure/config/database.ts
import mongoose from 'mongoose';
import { config } from './env';

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.get('DATABASE_URL'), {
        maxPoolSize: config.get('DATABASE_MAX_CONNECTIONS'),
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new DatabaseConnectionError(error as Error);
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}
```

## Logging Estruturado

### Winston Logger
```typescript
// src/infrastructure/config/logger.ts
import winston from 'winston';
import { config } from './env';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

export const logger = winston.createLogger({
  level: config.get('LOG_LEVEL'),
  format: logFormat,
  defaultMeta: {
    service: 'user-service',
    environment: config.get('NODE_ENV'),
  },
  transports: [
    new winston.transports.Console({
      format: config.isDevelopment() 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat,
    }),
  ],
});

// Add file transport in production
if (config.isProduction()) {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
  }));
}

@injectable()
export class WinstonLogger implements Logger {
  info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  error(message: string, error?: Error): void {
    logger.error(message, { 
      error: error?.message,
      stack: error?.stack,
    });
  }

  warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }
}
```

## Testes Robustos

### Unit Tests com Jest
```typescript
// tests/unit/use-cases/create-user.use-case.test.ts
import { CreateUserUseCase } from '../../../src/application/use-cases/create-user.use-case';
import { CreateUserCommand } from '../../../src/application/commands/create-user.command';
import { User } from '../../../src/domain/entities/user.entity';
import { DuplicateEmailError } from '../../../src/shared/errors/domain.errors';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    createUserUseCase = new CreateUserUseCase(
      mockUserRepository,
      mockEmailService,
      mockLogger
    );
  });

  describe('execute', () => {
    it('should create user successfully when email is unique', async () => {
      // Arrange
      const command = new CreateUserCommand('John Doe', 'john@example.com');
      const expectedUser = User.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(expectedUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue();

      // Act
      const result = await createUserUseCase.execute(command);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.value.name).toBe('John Doe');
      expect(result.value.email).toBe('john@example.com');
      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating user',
        { email: 'john@example.com' }
      );
    });

    it('should return failure when email already exists', async () => {
      // Arrange
      const command = new CreateUserCommand('John Doe', 'john@example.com');
      const existingUser = User.create({
        name: 'Existing User',
        email: 'john@example.com',
      });

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act
      const result = await createUserUseCase.execute(command);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(DuplicateEmailError);
      expect(result.error.message).toContain('john@example.com');
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      const command = new CreateUserCommand('John Doe', 'john@example.com');
      const unexpectedError = new Error('Database connection failed');

      mockUserRepository.findByEmail.mockRejectedValue(unexpectedError);

      // Act
      const result = await createUserUseCase.execute(command);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Failed to create user');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create user',
        unexpectedError
      );
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/user.integration.test.ts
import request from 'supertest';
import { app } from '../../src/main';
import { DatabaseConnection } from '../../src/infrastructure/config/database';
import { container } from '../../src/shared/container';

describe('User Integration Tests', () => {
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();
  });

  afterAll(async () => {
    await dbConnection.disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase();
  });

  describe('POST /api/users', () => {
    it('should create user successfully with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25,
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toContainEqual({
        field: 'email',
        message: 'Invalid email format',
        value: 'invalid-email',
      });
    });

    it('should return conflict error for duplicate email', async () => {
      // Create first user
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Try to create user with same email
      const duplicateUserData = {
        name: 'Jane Doe',
        email: 'john@example.com',
        age: 30,
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user when found', async () => {
      // Create user first
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        });

      const userId = createResponse.body.data.id;

      // Get user
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.name).toBe('John Doe');
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  async function cleanDatabase() {
    // Implementation depends on your database
    // For MongoDB with Mongoose:
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map(collection => collection.deleteMany({})));
  }
});
```

## 🤖 INSTRUÇÕES PARA CLAUDE CODE

### Template de Contexto Node.js
```markdown
PROJETO: [nome-do-projeto]
STACK: Node.js + TypeScript + Express + MongoDB/PostgreSQL
PADRÕES: CLAUDE.md + CLAUDE-NODEJS.md obrigatório
DI: InversifyJS container
VALIDAÇÃO: Zod schemas
ERROR HANDLING: Result pattern + custom errors
LOGS: Winston estruturado
TESTES: Jest + Supertest + mocks
TIPAGEM: TypeScript strict mode
```

### Prompts Específicos para Node.js

**Para API Endpoints:**
```
"Crie endpoint [funcionalidade] seguindo CLAUDE-NODEJS.md:

OBRIGATÓRIO:
- Controller com DI (@inject)
- Validation middleware com Zod
- Result pattern para error handling
- DTOs com mappers
- Logs estruturados com contexto
- Testes integration completos
- Zero acoplamento

ENDPOINT: [especificação]
VALIDAÇÕES: [regras]"
```

**Para Use Cases:**
```
"Crie use case [nome] seguindo CLAUDE-NODEJS.md:

OBRIGATÓRIO:
- @injectable com constructor injection
- Result pattern para retornos
- Custom errors específicas
- Validação defensiva
- Logs com contexto
- Testes unitários mockados
- Interface abstractions

RESPONSABILIDADES: [lista]
DEPENDÊNCIAS: [repositories/services]"
```

**Para Repositórios:**
```
"Implemente repository [nome] seguindo CLAUDE-NODEJS.md:

OBRIGATÓRIO:
- Interface no domain
- Implementação na infrastructure
- async/await, nunca callbacks
- Error handling com custom errors
- Logs estruturados
- Testes com database real
- TypeScript strict

ENTIDADE: [especificação]
OPERAÇÕES: [CRUD específicas]"
```

### Checklist Node.js
```markdown
□ TypeScript: strict mode habilitado?
□ DI: Container configurado, @inject usado?
□ Validation: Zod schemas + middleware?
□ Errors: Result pattern + custom error hierarchy?
□ Logs: Winston estruturado com contexto?
□ Config: Environment validation com Zod?
□ Testes: Unit + Integration com mocks?
□ Async: await usado, callbacks eliminados?
□ DTOs: Schemas + mappers implementados?
□ Performance: Connection pooling + optimizations?
```

---

## Conclusão Node.js

Este guia garante código Node.js de alta qualidade com:

1. **Zero acoplamento** via dependency injection
2. **Type safety** com TypeScript strict
3. **Robustez** com Result pattern e error handling
4. **Validação** defensiva com Zod schemas
5. **Observabilidade** com logging estruturado
6. **Testabilidade** com mocks e integration tests

Sempre referencie este documento junto com CLAUDE.md principal para desenvolvimento Node.js!