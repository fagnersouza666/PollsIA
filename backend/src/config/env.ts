import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/pollsia'),
  SUPABASE_URL: z.string().default(''),
  SUPABASE_KEY: z.string().default(''),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  SOLANA_RPC_URL: z.string().default('https://api.mainnet-beta.solana.com'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('dev-secret-key-change-in-production-12345678'),

  // APIs Externas para detecção de LP positions
  HELIUS_API_KEY: z.string().optional(),
  BIRDEYE_API_KEY: z.string().optional(),
});

export const config = envSchema.parse(process.env);