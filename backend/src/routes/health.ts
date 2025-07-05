/**
 * Health check and monitoring endpoints
 */
import { FastifyInstance } from 'fastify';
import { createClient } from 'redis';
import { Connection } from '@solana/web3.js';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    solana: 'healthy' | 'unhealthy';
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export async function registerHealthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/health', async (request, reply) => {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'healthy',
        redis: 'healthy',
        solana: 'healthy'
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      }
    };

    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      healthStatus.memory = {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      };

      // Check Redis connection
      try {
        const redis = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        await redis.connect();
        await redis.ping();
        await redis.disconnect();
        healthStatus.services.redis = 'healthy';
      } catch (error) {
        healthStatus.services.redis = 'unhealthy';
        healthStatus.status = 'unhealthy';
      }

      // Check Solana connection
      try {
        const connection = new Connection(
          process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
        );
        await connection.getVersion();
        healthStatus.services.solana = 'healthy';
      } catch (error) {
        healthStatus.services.solana = 'unhealthy';
        healthStatus.status = 'unhealthy';
      }

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      reply.status(statusCode).send(healthStatus);
    } catch (error) {
      reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Readiness check
  fastify.get('/ready', async (request, reply) => {
    reply.status(200).send({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  });

  // Liveness check
  fastify.get('/alive', async (request, reply) => {
    reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
}