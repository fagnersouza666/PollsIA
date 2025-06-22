import { AnalyticsService } from '../src/services/AnalyticsService';
import { PoolService } from '../src/services/PoolService';
import { WalletService } from '../src/services/WalletService';

jest.mock('../src/services/PoolService');
jest.mock('../src/services/WalletService');

const MockedPoolService = PoolService as jest.MockedClass<typeof PoolService>;
const MockedWalletService = WalletService as jest.MockedClass<typeof WalletService>;

beforeEach(() => {
  MockedPoolService.mockClear();
  MockedWalletService.mockClear();
});

describe('AnalyticsService', () => {
  it('getPerformance returns metrics with history', async () => {
    const walletInstance = new WalletService();
    (walletInstance.getPortfolio as jest.Mock).mockResolvedValue({ totalValue: 1000, solBalance: 1, tokenAccounts: 0, change24h: 0, performance: [] });
    (WalletService as any).mockImplementation(() => walletInstance);

    const service = new AnalyticsService();
    const perf = await service.getPerformance('pub', '7d');
    expect(perf.history.length).toBeGreaterThan(0);
    expect(perf).toHaveProperty('totalReturn');
  });

  it('getMarketOverview returns fallback when pools empty', async () => {
    const poolInstance = new PoolService();
    (poolInstance.discoverPools as jest.Mock).mockResolvedValue([]);
    (PoolService as any).mockImplementation(() => poolInstance);

    const service = new AnalyticsService();
    const overview = await service.getMarketOverview();
    expect(overview.totalTvl).toBeGreaterThan(0); // Fallback data has non-zero TVL
    expect(overview.topPools.length).toBeGreaterThan(0); // Fallback has default pools
  });

  it('getOpportunities filters by risk', async () => {
    const poolInstance = new PoolService();
    (poolInstance.discoverPools as jest.Mock).mockResolvedValue([
      { id: '1', tokenA: 'SOL', tokenB: 'USDC', apy: 20, tvl: 2000000, volume24h: 400000, protocol: 'Raydium' }
    ]);
    (poolInstance.getRankings as jest.Mock).mockResolvedValue([
      { rank: 1, poolId: '1', score: 90, apy: 20, riskScore: 4, liquidityScore: 9 }
    ]);
    (PoolService as any).mockImplementation(() => poolInstance);

    const service = new AnalyticsService();
    const opps = await service.getOpportunities('conservative');
    expect(opps.length).toBe(1);
    expect(opps[0].poolId).toBe('1');
  });
});
