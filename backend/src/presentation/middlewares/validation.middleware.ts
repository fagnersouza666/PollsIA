import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (schema.body) {
        request.body = schema.body.parse(request.body);
      }
      
      if (schema.query) {
        request.query = schema.query.parse(request.query);
      }
      
      if (schema.params) {
        request.params = schema.params.parse(request.params);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            context: { errors: validationErrors },
          },
          timestamp: new Date().toISOString(),
        });
      }
      
      throw error;
    }
  };
};