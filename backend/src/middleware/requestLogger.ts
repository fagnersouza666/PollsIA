/**
 * Request logging middleware for production monitoring
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export interface RequestWithId extends FastifyRequest {
  id: string;
}

export async function registerRequestLogger(fastify: FastifyInstance) {
  // Add request ID to each request
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    (request as RequestWithId).id = randomUUID();
    reply.header('X-Request-ID', (request as RequestWithId).id);
  });

  // Log requests in production format
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = (request as RequestWithId).id;
    const duration = reply.getResponseTime();
    
    const logData = {
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: Math.round(duration),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      contentLength: reply.getHeader('content-length'),
    };

    // Log different levels based on status code
    if (reply.statusCode >= 500) {
      fastify.log.error(logData, 'Server Error');
    } else if (reply.statusCode >= 400) {
      fastify.log.warn(logData, 'Client Error');
    } else {
      fastify.log.info(logData, 'Request Completed');
    }
  });

  // Log errors with request context
  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    const requestId = (request as RequestWithId).id;
    
    fastify.log.error({
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      url: request.url,
      ip: request.ip,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }, 'Request Error');
  });
}