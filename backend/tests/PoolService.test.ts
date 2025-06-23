import axios from 'axios';
import { PoolService } from '../src/services/PoolService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoolService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('discoverPools should return fallback data with filtering', async () => {
    // Simular falha na API para usar fallback
    mockedAxios.get.mockRejectedValue(new Error('API unavailable'));

    const service = new PoolService();

    // Teste sem filtros - deve retornar todos os pools de fallback
    const allPools = await service.discoverPools();
    expect(allPools).toHaveLength(5);
    expect(allPools[0]).toEqual(expect.objectContaining({
      tokenA: 'SOL',
      tokenB: 'USDC',
      protocol: 'Raydium'
    }));

    // Teste com filtro de TVL alto - deve filtrar (adicionando limit obrigatório)
    const filteredPools = await service.discoverPools({ minTvl: 20000000, limit: 10 });
    expect(filteredPools).toHaveLength(1); // Apenas USDC-USDT tem TVL >= 20M
    expect(filteredPools[0].tokenA).toBe('USDC');
    expect(filteredPools[0].tokenB).toBe('USDT');

    // Teste com limite
    const limitedPools = await service.discoverPools({ limit: 2 });
    expect(limitedPools).toHaveLength(2);
  });

  it('getRankings should sort pools by calculated score', async () => {
    const service = new PoolService();
    jest.spyOn(service, 'discoverPools').mockResolvedValue([
      { id: '1', tokenA: 'SOL', tokenB: 'USDC', apy: 10, tvl: 2000000, volume24h: 500000, protocol: 'Raydium' },
      { id: '2', tokenA: 'SOL', tokenB: 'USDT', apy: 5, tvl: 1000000, volume24h: 100000, protocol: 'Raydium' }
    ]);

    const rankings = await service.getRankings();
    expect(rankings[0].score).toBeGreaterThanOrEqual(rankings[1].score);
    expect(rankings[0].rank).toBe(1);
    expect(rankings[1].rank).toBe(2);
  });

  it('analyzePool should return analysis metrics', async () => {
    const service = new PoolService();
    jest.spyOn(service, 'discoverPools').mockResolvedValue([
      { id: 'pool1', tokenA: 'SOL', tokenB: 'USDC', apy: 10, tvl: 2000000, volume24h: 400000, protocol: 'Raydium' }
    ]);

    const analysis = await service.analyzePool('pool1', {} as any);

    expect(analysis.poolId).toBe('pool1');
    expect(analysis.impermanentLoss).toHaveProperty('current');
    expect(analysis.volumeAnalysis).toHaveProperty('trend');
    expect(analysis.riskMetrics).toHaveProperty('overall');
  });

  it('discoverPools returns fallback data on error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('fail'));
    const service = new PoolService();
    const pools = await service.discoverPools();
    expect(pools.length).toBeGreaterThan(0);
    expect(pools[0]).toHaveProperty('protocol', 'Raydium');
  });

  it('analyzePool throws when pool missing', async () => {
    const service = new PoolService();
    jest.spyOn(service, 'discoverPools').mockResolvedValue([]);
    await expect(service.analyzePool('none', {} as any)).rejects.toThrow('Pool none not found');
  });
});
