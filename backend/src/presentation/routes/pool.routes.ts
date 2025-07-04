import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { container } from '../../shared/container';
import { TYPES } from '../../shared/types';
import { PoolController } from '../controllers/pool.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  CreatePoolRequestSchema,
  GetPoolsQuerySchema,
  PoolParamsSchema 
} from '../dto/pool.dto';

export const poolRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const poolController = container.get<PoolController>(TYPES.PoolController);

  // Create pool
  fastify.post(
    '/',
    {
      preHandler: validateRequest({ body: CreatePoolRequestSchema }),
      schema: {
        description: 'Create a new liquidity pool',
        tags: ['pools'],
        body: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            name: { type: 'string' },
            tokenAAddress: { type: 'string' },
            tokenBAddress: { type: 'string' },
            initialLiquidityA: { type: 'number' },
            initialLiquidityB: { type: 'number' },
            fee: { type: 'number' },
          },
          required: ['address', 'name', 'tokenAAddress', 'tokenBAddress', 'initialLiquidityA', 'initialLiquidityB', 'fee'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    poolController.createPool.bind(poolController)
  );

  // Get pools
  fastify.get(
    '/',
    {
      preHandler: validateRequest({ query: GetPoolsQuerySchema }),
      schema: {
        description: 'Get paginated list of pools',
        tags: ['pools'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['tvl', 'volume24h', 'apr', 'fees24h', 'createdAt'] },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
            minTvl: { type: 'number', minimum: 0 },
            maxTvl: { type: 'number', minimum: 0 },
            minApr: { type: 'number', minimum: 0 },
            maxApr: { type: 'number', minimum: 0 },
            activeOnly: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  items: { type: 'array' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    poolController.getPools.bind(poolController)
  );

  // Get pool by ID
  fastify.get(
    '/:id',
    {
      preHandler: validateRequest({ params: PoolParamsSchema }),
      schema: {
        description: 'Get pool by ID',
        tags: ['pools'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    poolController.getPoolById.bind(poolController)
  );
};