import { z } from 'zod';

export const performanceQuerySchema = z.object({
  publicKey: z.string().min(32, 'Invalid public key').max(50, 'Public key too long'),
  timeframe: z.enum(['1d', '7d', '30d', '90d']).optional().default('30d'),
});

export const opportunitiesQuerySchema = z.object({
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  limit: z.string().optional().transform((val) => val ? Number(val) : 10).pipe(z.number().min(1).max(50)),
});

export type PerformanceQuery = z.infer<typeof performanceQuerySchema>;
export type OpportunitiesQuery = z.infer<typeof opportunitiesQuerySchema>;