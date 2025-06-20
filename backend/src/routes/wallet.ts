import { FastifyPluginAsync } from 'fastify';
import { WalletService } from '../services/WalletService';
import { walletConnectSchema, publicKeyParamSchema } from '../schemas/wallet';
import { ApiResponse } from '../types/pool';
import { WalletConnection, Portfolio, Position } from '../types/wallet';

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  const walletService = new WalletService();

  fastify.post<{
    Body: typeof walletConnectSchema._output;
    Reply: ApiResponse<WalletConnection>;
  }>('/connect', {
    schema: {
      body: walletConnectSchema,
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
      const { publicKey, signature } = request.body;
      const result = await walletService.connectWallet(publicKey, signature);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(`Wallet connection error for ${request.body.publicKey}:`, error);
      return reply.status(400).send({
        success: false,
        error: 'Failed to connect wallet',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Params: typeof publicKeyParamSchema._output;
    Reply: ApiResponse<Portfolio>;
  }>('/portfolio/:publicKey', {
    schema: {
      params: publicKeyParamSchema,
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
      const portfolio = await walletService.getPortfolio(publicKey);
      return {
        success: true,
        data: portfolio,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(`Portfolio error for ${request.params.publicKey}:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get portfolio',
        timestamp: new Date().toISOString()
      });
    }
  });

  fastify.get<{
    Params: typeof publicKeyParamSchema._output;
    Reply: ApiResponse<Position[]>;
  }>('/positions/:publicKey', {
    schema: {
      params: publicKeyParamSchema,
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
      const { publicKey } = request.params;
      const positions = await walletService.getPositions(publicKey);
      return {
        success: true,
        data: positions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      fastify.log.error(`Positions error for ${request.params.publicKey}:`, error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get positions',
        timestamp: new Date().toISOString()
      });
    }
  });
};