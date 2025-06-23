import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

async function start() {
  try {
    await fastify.listen({
      port: 3003,
      host: '0.0.0.0'
    });
    console.log('🚀 Test server running on port 3003');
  } catch (err) {
    console.error('Error starting test server:', err);
    process.exit(1);
  }
}

start();