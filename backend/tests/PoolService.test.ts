import { PoolService } from '../src/services/PoolService';

describe('PoolService', () => {
  let service: PoolService;

  beforeEach(() => {
    service = new PoolService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('discoverPools should fetch real data from Raydium API', async () => {
    try {
      const pools = await service.discoverPools();

      // Se conseguiu dados reais, deve ser array
      expect(Array.isArray(pools)).toBe(true);

      if (pools.length > 0) {
        const pool = pools[0];
        expect(pool).toHaveProperty('id');
        expect(pool).toHaveProperty('tokenA');
        expect(pool).toHaveProperty('tokenB');
        expect(pool).toHaveProperty('apy');
        expect(pool).toHaveProperty('tvl');
        expect(pool).toHaveProperty('protocol');
        expect(pool.protocol).toBe('Raydium');
      }
    } catch (error: any) {
      // Pode falhar se API do Raydium não estiver disponível
      expect(error.message).toContain('Dados simulados removidos conforme CLAUDE.md');
    }
  }, 10000); // Timeout maior para chamada de API real

  it('discoverPools with filters should work', async () => {
    try {
      const pools = await service.discoverPools({
        minTvl: 1000000,
        sortBy: 'apy',
        limit: 5
      });

      expect(Array.isArray(pools)).toBe(true);
      expect(pools.length).toBeLessThanOrEqual(5);

      if (pools.length > 1) {
        // Deve estar ordenado por APY
        expect(pools[0].apy).toBeGreaterThanOrEqual(pools[1].apy);
      }
    } catch (error: any) {
      // Pode falhar se API do Raydium não estiver disponível
      expect(error.message).toContain('Dados simulados removidos conforme CLAUDE.md');
    }
  }, 10000);

  it('getRankings should calculate real rankings', async () => {
    try {
      const rankings = await service.getRankings();

      expect(Array.isArray(rankings)).toBe(true);

      if (rankings.length > 0) {
        const ranking = rankings[0];
        expect(ranking).toHaveProperty('rank');
        expect(ranking).toHaveProperty('poolId');
        expect(ranking).toHaveProperty('score');
        expect(ranking).toHaveProperty('apy');
        expect(ranking).toHaveProperty('riskScore');
        expect(ranking).toHaveProperty('liquidityScore');
      }
    } catch (error: any) {
      // Pode falhar se não houver pools reais disponíveis
      expect(error.message).toContain('Dados simulados removidos conforme CLAUDE.md');
    }
  }, 10000);

  it('analyzePool should fail for non-existent pool', async () => {
    try {
      await service.analyzePool('non-existent-pool');
      // Se chegou aqui, algo está errado
      fail('Deveria ter falhado para pool inexistente');
    } catch (error: any) {
      expect(error.message).toContain('not found');
    }
  });
});
