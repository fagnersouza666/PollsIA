import { z } from 'zod';

export const poolIdSchema = z.object({
  poolId: z.string().min(1, 'Pool ID is required').max(100, 'Pool ID too long')
});

export const poolDiscoveryQuerySchema = z.object({
  protocol: z.enum(['raydium', 'orca', 'all']).optional(),
  minTvl: z.string().optional().transform((val) => val ? Number(val) : undefined).pipe(z.number().optional()),
  maxRisk: z.enum(['low', 'medium', 'high']).optional(),
  sortBy: z.enum(['apy', 'tvl', 'volume']).optional(),
  limit: z.string().optional().transform((val) => val ? Number(val) : 50).pipe(z.number().min(1).max(100)),
});

export const poolAnalysisQuerySchema = z.object({
  timeframe: z.enum(['1h', '24h', '7d', '30d']).optional(),
  includeHistory: z.boolean().optional(),
});

export type PoolIdParams = z.infer<typeof poolIdSchema>;
export type PoolDiscoveryQuery = z.infer<typeof poolDiscoveryQuerySchema>;
export type PoolAnalysisQuery = z.infer<typeof poolAnalysisQuerySchema>;