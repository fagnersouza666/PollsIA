import { FastifyPluginAsync } from 'fastify';
import { AnalyticsService } from '../services/AnalyticsService';
import { performanceQuerySchema, opportunitiesQuerySchema } from '../schemas/analytics';
import { ApiResponse } from '../types/pool';
import { PerformanceData, MarketOverview, Opportunity } from '../types/analytics';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const analyticsService = new AnalyticsService();

  fastify.get<{
    Params: { publicKey: string };
    Querystring: typeof performanceQuerySchema._output;
    Reply: ApiResponse<PerformanceData>;
  }>('/performance/:publicKey', {
    schema: {
      params: {
        type: 'object',
        required: ['publicKey'],
        properties: {
          publicKey: { type: 'string', minLength: 32, maxLength: 50 }
        }
      },
      querystring: performanceQuerySchema,
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
      const { publicKey } = request.params;
      const performance = await analyticsService.getPerformance(publicKey, request.query.timeframe);
      return {
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(`Performance analytics error for ${request.params.publicKey}:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get performance data',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Reply: ApiResponse<MarketOverview>;
  }>('/market-overview', {
    schema: {
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
      const overview = await analyticsService.getMarketOverview();
      return {
        success: true,
        data: overview,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Market overview error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get market overview',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Querystring: typeof opportunitiesQuerySchema._output;
    Reply: ApiResponse<Opportunity[]>;
  }>('/opportunities', {
    schema: {
      querystring: opportunitiesQuerySchema,
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
      const opportunities = await analyticsService.getOpportunities(request.query?.riskLevel);
      return {
        success: true,
        data: opportunities,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Opportunities analytics error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get opportunities',
        timestamp: new Date().toISOString()
      });
    }
  });
};