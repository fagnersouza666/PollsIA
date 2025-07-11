import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { container } from '../shared/container';
import { WalletController } from '../presentation/controllers/wallet.controller';

export const walletRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const walletController = container.resolve(WalletController);

  // Schemas can be added here if needed, for now we simplify
  // fastify.addSchema(...)

  // Connect Wallet
  fastify.post(
    '/connect',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Connect wallet',
        body: {
          type: 'object',
          required: ['publicKey', 'signature'],
          properties: {
            publicKey: { type: 'string' },
            signature: { type: 'string' }
          }
        }
        // Add more schema details if needed
      }
    },
    walletController.connectWallet.bind(walletController)
  );

  // Get Portfolio
  fastify.get(
    '/:address/portfolio',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Get wallet portfolio',
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      }
    },
    walletController.getPortfolio.bind(walletController)
  );

  // Get Positions
  fastify.get(
    '/:address/positions',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Get wallet positions',
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      }
    },
    walletController.getPositions.bind(walletController)
  );

  // Get Wallet Pools
  fastify.get(
    '/:address/pools',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Get user pools in wallet',
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      }
    },
    walletController.getWalletPools.bind(walletController)
  );

  // Get All Tokens Detailed
  fastify.get(
    '/:address/tokens',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Get all detailed tokens in wallet',
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      }
    },
    walletController.getAllTokensDetailed.bind(walletController)
  );

  // Disconnect Wallet
  fastify.post(
    '/:address/disconnect',
    {
      schema: {
        tags: ['Wallet'],
        summary: 'Disconnect wallet',
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' }
          }
        }
      }
    },
    walletController.disconnectWallet.bind(walletController)
  );
};