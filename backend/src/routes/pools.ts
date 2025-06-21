import { FastifyPluginAsync } from 'fastify';
import { PoolService } from '../services/PoolService';
import { poolIdSchema, poolDiscoveryQuerySchema, poolAnalysisQuerySchema } from '../schemas/pool';
import { ApiResponse, Pool, PoolRanking, PoolAnalysis } from '../types/pool';

export const poolRoutes: FastifyPluginAsync = async (fastify) => {
  const poolService = new PoolService();

  fastify.get<{
    Querystring: any;
    Reply: ApiResponse<Pool[]>;
  }>('/discover', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          protocol: { type: 'string', enum: ['raydium', 'orca', 'all'] },
          minTvl: { type: 'string' },
          maxRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
          sortBy: { type: 'string', enum: ['apy', 'tvl', 'volume'] },
          limit: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Parse and validate query parameters
      const query = poolDiscoveryQuerySchema.parse(request.query);
      const pools = await poolService.discoverPools(query);
      return { 
        success: true, 
        data: pools,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool discovery error:', error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to discover pools',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Reply: ApiResponse<PoolRanking[]>;
  }>('/rankings', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const rankings = await poolService.getRankings();
      return { 
        success: true, 
        data: rankings,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool rankings error:', error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to get pool rankings',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Params: any;
    Querystring: any;
    Reply: ApiResponse<PoolAnalysis>;
  }>('/:poolId/analysis', {
    schema: {
      params: {
        type: 'object',
        properties: {
          poolId: { type: 'string' }
        },
        required: ['poolId']
      },
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['1h', '24h', '7d', '30d'] },
          includeHistory: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const params = poolIdSchema.parse(request.params);
      const query = poolAnalysisQuerySchema.parse(request.query);
      const analysis = await poolService.analyzePool(params.poolId, query);
      return { 
        success: true, 
        data: analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Pool analysis error:', error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to analyze pool',
        timestamp: new Date().toISOString()
      });
    }
  });
};