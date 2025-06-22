import axios from 'axios';
import { PoolService } from '../src/services/PoolService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoolService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('discoverPools should transform and filter Raydium data', async () => {
    mockedAxios.get.mockResolvedValue({ data: [
      { ammId: '1', baseMint: 'So11111111111111111111111111111111111111112', quoteMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', liquidity: 200000, volume24h: 10000, apr24h: 5 },
      { ammId: '2', baseMint: 'TOKENA', quoteMint: 'TOKENB', liquidity: 50000, volume24h: 1000, apr24h: 3 }
    ]});

    const service = new PoolService();
    const pools = await service.discoverPools({ minTvl: 100000 });

    expect(pools).toHaveLength(1);
    expect(pools[0]).toEqual(expect.objectContaining({
      id: '1',
      tokenA: 'SOL',
      tokenB: 'USDC',
      apy: 5,
      tvl: 200000,
      protocol: 'Raydium'
    }));
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

  it('discoverPools returns empty array on error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('fail'));
    const service = new PoolService();
    const pools = await service.discoverPools();
    expect(pools).toEqual([]);
  });

  it('analyzePool throws when pool missing', async () => {
    const service = new PoolService();
    jest.spyOn(service, 'discoverPools').mockResolvedValue([]);
    await expect(service.analyzePool('none', {} as any)).rejects.toThrow('Pool none not found');
  });
});
