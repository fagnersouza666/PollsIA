import { FastifyPluginAsync } from 'fastify';
import { PoolService } from '../services/PoolService';
import { poolIdSchema, poolDiscoveryQuerySchema, poolAnalysisQuerySchema } from '../schemas/pool';
import { ApiResponse, Pool, PoolRanking, PoolAnalysis } from '../types/pool';

export const poolRoutes: FastifyPluginAsync = async (fastify) => {
  const poolService = new PoolService();

  fastify.get<{
    Querystring: typeof poolDiscoveryQuerySchema._output;
    Reply: ApiResponse<Pool[]>;
  }>('/discover', {
    schema: {
      querystring: poolDiscoveryQuerySchema,
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
      const pools = await poolService.discoverPools(request.query);
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
    Params: typeof poolIdSchema._output;
    Querystring: typeof poolAnalysisQuerySchema._output;
    Reply: ApiResponse<PoolAnalysis>;
  }>('/:poolId/analysis', {
    schema: {
      params: poolIdSchema,
      querystring: poolAnalysisQuerySchema,
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
      const { poolId } = request.params;
      const analysis = await poolService.analyzePool(poolId, request.query);
      return { 
        success: true, 
        data: analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(`Pool analysis error for ${request.params.poolId}:`, error);
      return reply.status(500).send({ 
        success: false, 
        error: 'Failed to analyze pool',
        timestamp: new Date().toISOString()
      });
    }
  });
};