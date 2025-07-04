import { z } from 'zod';

// Request schemas
export const CreatePoolRequestSchema = z.object({
  address: z.string()
    .min(1, 'Pool address is required')
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format'),
  name: z.string()
    .min(2, 'Pool name must be at least 2 characters')
    .max(100, 'Pool name must not exceed 100 characters')
    .trim(),
  tokenAAddress: z.string()
    .min(1, 'Token A address is required')
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format'),
  tokenBAddress: z.string()
    .min(1, 'Token B address is required')
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format'),
  initialLiquidityA: z.number()
    .positive('Initial liquidity for Token A must be positive')
    .max(1e18, 'Initial liquidity for Token A is too large'),
  initialLiquidityB: z.number()
    .positive('Initial liquidity for Token B must be positive')
    .max(1e18, 'Initial liquidity for Token B is too large'),
  fee: z.number()
    .min(0, 'Fee must be non-negative')
    .max(1, 'Fee must not exceed 100%'),
});

export const GetPoolsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['tvl', 'volume24h', 'apr', 'fees24h', 'createdAt']).default('tvl'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minTvl: z.coerce.number().min(0).optional(),
  maxTvl: z.coerce.number().min(0).optional(),
  minApr: z.coerce.number().min(0).optional(),
  maxApr: z.coerce.number().min(0).optional(),
  activeOnly: z.coerce.boolean().optional(),
});

export const PoolParamsSchema = z.object({
  id: z.string().min(1, 'Pool ID is required'),
});

// Inferred types
export type CreatePoolRequest = z.infer<typeof CreatePoolRequestSchema>;
export type GetPoolsQuery = z.infer<typeof GetPoolsQuerySchema>;
export type PoolParams = z.infer<typeof PoolParamsSchema>;

// Response schemas
export const PoolResponseSchema = z.object({
  id: z.string(),
  address: z.string(),
  name: z.string(),
  tokenAAddress: z.string(),
  tokenBAddress: z.string(),
  liquidity: z.number(),
  volume24h: z.number(),
  fees24h: z.number(),
  apr: z.number(),
  tvl: z.number(),
  price: z.number(),
  priceChange24h: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PoolResponse = z.infer<typeof PoolResponseSchema>;

// Validation middleware helper
export const validateCreatePoolRequest = (data: unknown): CreatePoolRequest => {
  return CreatePoolRequestSchema.parse(data);
};

export const validateGetPoolsQuery = (data: unknown): GetPoolsQuery => {
  return GetPoolsQuerySchema.parse(data);
};

export const validatePoolParams = (data: unknown): PoolParams => {
  return PoolParamsSchema.parse(data);
};