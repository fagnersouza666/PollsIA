import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const timestamp = new Date().toISOString();
  
  // Log the error
  request.log.error({
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp,
  });

  // Validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: error.validation,
      timestamp,
    });
  }

  // Custom application errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      timestamp,
    });
  }

  // Generic server error
  return reply.status(500).send({
    success: false,
    error: 'Internal server error',
    timestamp,
  });
}