/**
 * Security middleware for production environment
 */
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

export async function registerSecurityMiddleware(fastify: FastifyInstance) {
  // CORS configuration
  await fastify.register(cors, {
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://your-domain.com',
        'https://www.your-domain.com'
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.mainnet-beta.solana.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    skipOnError: true,
    keyGenerator: (request: FastifyRequest) => {
      return request.ip;
    },
    errorResponseBuilder: (request: FastifyRequest, context: any) => {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        date: Date.now(),
        expiresIn: Math.round(context.ttl / 1000)
      };
    }
  });

  // API-specific rate limiting
  await fastify.register(rateLimit, {
    max: 50,
    timeWindow: '1 minute',
    skipOnError: true,
    keyGenerator: (request: FastifyRequest) => {
      return `api_${request.ip}`;
    },
    nameSpace: 'api'
  });
}