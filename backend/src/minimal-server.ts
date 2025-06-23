import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: '127.0.0.1' });
    console.log('Minimal server running on port 8080');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();