import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';
import { Logger } from '../../shared/interfaces/logger.interface';
import { CreatePoolUseCase } from '../../application/use-cases/create-pool.use-case';
import { GetPoolsUseCase, GetPoolsQuery } from '../../application/use-cases/get-pools.use-case';
import { CreatePoolCommand } from '../../application/commands/create-pool.command';
import { BaseError } from '../../shared/errors';

interface CreatePoolBody {
  address: string;
  name: string;
  tokenAAddress: string;
  tokenBAddress: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
  fee: number;
}

@injectable()
export class PoolController {
  constructor(
    @inject(TYPES.CreatePoolUseCase) private createPoolUseCase: CreatePoolUseCase,
    @inject(TYPES.GetPoolsUseCase) private getPoolsUseCase: GetPoolsUseCase,
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async createPool(
    request: FastifyRequest<{ Body: CreatePoolBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const command = new CreatePoolCommand(
      request.body.address,
      request.body.name,
      request.body.tokenAAddress,
      request.body.tokenBAddress,
      request.body.initialLiquidityA,
      request.body.initialLiquidityB,
      request.body.fee
    );

    const result = await this.createPoolUseCase.execute(command);

    result.match(
      (pool) => {
        reply.status(201).send({
          success: true,
          data: pool.toJSON(),
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        this.handleError(reply, error);
      }
    );
  }

  async getPools(
    request: FastifyRequest<{ Querystring: GetPoolsQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const query = request.query;

    const result = await this.getPoolsUseCase.execute(query);

    result.match(
      (paginatedPools) => {
        reply.send({
          success: true,
          data: {
            items: paginatedPools.items.map(pool => pool.toJSON()),
            page: paginatedPools.page,
            limit: paginatedPools.limit,
            total: paginatedPools.total,
            totalPages: paginatedPools.totalPages,
          },
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        this.handleError(reply, error);
      }
    );
  }

  async getPoolById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    // TODO: Implement GetPoolByIdUseCase
    reply.status(501).send({
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'GetPoolById not implemented yet',
      },
      timestamp: new Date().toISOString(),
    });
  }

  private handleError(reply: FastifyReply, error: Error): void {
    if (error instanceof BaseError) {
      reply.status(error.statusCode).send({
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
      reply.status(500).send({
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