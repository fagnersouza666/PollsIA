import { FastifyPluginAsync } from 'fastify';
import { AnalyticsService } from '../services/AnalyticsService';
import { performanceQuerySchema, opportunitiesQuerySchema } from '../schemas/analytics';
import { ApiResponse } from '../types/pool';
import { PerformanceData, MarketOverview, Opportunity } from '../types/analytics';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  const analyticsService = new AnalyticsService();

  fastify.get<{
    Params: any;
    Querystring: any;
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
      querystring: {
        type: 'object',
        properties: {
          timeframe: { type: 'string', enum: ['7d', '30d', '90d', '1y'] }
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
      const params = { publicKey: (request.params as any).publicKey };
      const query = performanceQuerySchema.parse(request.query);
      const performance = await analyticsService.getPerformance(params.publicKey, query.timeframe);
      return {
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Performance analytics error:', error);
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
    Querystring: any;
    Reply: ApiResponse<Opportunity[]>;
  }>('/opportunities', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          riskLevel: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] }
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
      const query = opportunitiesQuerySchema.parse(request.query);
      const opportunities = await analyticsService.getOpportunities(query.riskLevel);
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