import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: [config.FRONTEND_URL, 'http://localhost:3000'],
      credentials: true
    });

    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      };
    });

    fastify.get('/', async (_request, reply) => {
      return reply.redirect('/health');
    });

    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0'
    });

    console.log(`🚀 Debug server running on port ${config.PORT}`);
  } catch (err) {
    console.error('Error starting debug server:', err);
    process.exit(1);
  }
}

start();