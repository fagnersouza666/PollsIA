import { FastifyPluginAsync } from 'fastify';
import { WalletService } from '../services/WalletService';
import { walletConnectSchema, publicKeyParamSchema } from '../schemas/wallet';
import { ApiResponse } from '../types/pool';
import { WalletConnection, Portfolio, Position } from '../types/wallet';

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  const walletService = new WalletService();

  fastify.post<{
    Body: any;
    Reply: ApiResponse<WalletConnection>;
  }>('/connect', {
    schema: {
      body: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' },
          signature: { type: 'string' }
        },
        required: ['publicKey', 'signature']
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
      const body = walletConnectSchema.parse(request.body);
      const { publicKey, signature } = body;
      const result = await walletService.connectWallet(publicKey, signature);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Wallet connection error:', error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to connect wallet',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Params: any;
    Reply: ApiResponse<Portfolio>;
  }>('/portfolio/:publicKey', {
    schema: {
      params: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' }
        },
        required: ['publicKey']
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
      const params = publicKeyParamSchema.parse(request.params);
      const { publicKey } = params;
      const portfolio = await walletService.getPortfolio(publicKey);
      return {
        success: true,
        data: portfolio,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Portfolio error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get portfolio',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Params: any;
    Reply: ApiResponse<Position[]>;
  }>('/positions/:publicKey', {
    schema: {
      params: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' }
        },
        required: ['publicKey']
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
      const params = publicKeyParamSchema.parse(request.params);
      const { publicKey } = params;
      const positions = await walletService.getPositions(publicKey);
      return {
        success: true,
        data: positions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error('Positions error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get positions',
        timestamp: new Date().toISOString()
      });
    }
  });
};