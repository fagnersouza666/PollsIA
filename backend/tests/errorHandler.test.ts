import { errorHandler } from '../src/middleware/errorHandler';
import { FastifyError } from 'fastify';

describe('errorHandler', () => {
  const reply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as any;
  const request = {
    log: { error: jest.fn() },
    url: '/test',
    method: 'GET'
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles validation errors', async () => {
    const err = { message: 'bad', validation: [{ msg: 'fail' }] } as any as FastifyError;
    await errorHandler(err, request, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send.mock.calls[0][0]).toHaveProperty('error', 'Validation failed');
  });

  it('handles custom statusCode errors', async () => {
    const err = { message: 'oops', statusCode: 404 } as any as FastifyError;
    await errorHandler(err, request, reply);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send.mock.calls[0][0]).toHaveProperty('error', 'oops');
  });

  it('handles generic errors', async () => {
    const err = { message: 'boom' } as any as FastifyError;
    await errorHandler(err, request, reply);
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send.mock.calls[0][0]).toHaveProperty('error', 'Internal server error');
  });
});
