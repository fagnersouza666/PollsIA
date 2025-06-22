import Fastify from 'fastify';
import { poolRoutes } from '../src/routes/pools';
import { walletRoutes } from '../src/routes/wallet';
import { analyticsRoutes } from '../src/routes/analytics';
import { PoolService } from '../src/services/PoolService';
import { WalletService } from '../src/services/WalletService';
import { AnalyticsService } from '../src/services/AnalyticsService';

jest.mock('../src/services/PoolService');
jest.mock('../src/services/WalletService');
jest.mock('../src/services/AnalyticsService');

const MockedPoolService = PoolService as jest.MockedClass<typeof PoolService>;
const MockedWalletService = WalletService as jest.MockedClass<typeof WalletService>;
const MockedAnalyticsService = AnalyticsService as jest.MockedClass<typeof AnalyticsService>;

describe('API routes', () => {
  let app: ReturnType<typeof Fastify>;
  let poolMock: jest.Mocked<PoolService>;
  let walletMock: jest.Mocked<WalletService>;
  let analyticsMock: jest.Mocked<AnalyticsService>;

  beforeEach(async () => {
    poolMock = {
      discoverPools: jest.fn(),
      getRankings: jest.fn(),
      analyzePool: jest.fn()
    } as any;
    walletMock = {
      connectWallet: jest.fn(),
      getPortfolio: jest.fn(),
      getPositions: jest.fn(),
      disconnectWallet: jest.fn()
    } as any;
    analyticsMock = {
      getPerformance: jest.fn(),
      getMarketOverview: jest.fn(),
      getOpportunities: jest.fn()
    } as any;

    MockedPoolService.mockImplementation(() => poolMock);
    MockedWalletService.mockImplementation(() => walletMock);
    MockedAnalyticsService.mockImplementation(() => analyticsMock);

    app = Fastify();
    await app.register(poolRoutes, { prefix: '/api/pools' });
    await app.register(walletRoutes, { prefix: '/api/wallet' });
    await app.register(analyticsRoutes, { prefix: '/api/analytics' });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('GET /api/pools/discover returns pools', async () => {
    poolMock.discoverPools.mockResolvedValue([{ id: '1' } as any]);
    const res = await app.inject({ method: 'GET', url: '/api/pools/discover' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).data[0].id).toBe('1');
  });

  it('GET /api/pools/1/analysis returns analysis', async () => {
    poolMock.analyzePool.mockResolvedValue({ poolId: '1' } as any);
    const res = await app.inject({ method: 'GET', url: '/api/pools/1/analysis' });
    expect(JSON.parse(res.payload).data.poolId).toBe('1');
  });

  it('POST /api/wallet/connect returns connection', async () => {
    walletMock.connectWallet.mockResolvedValue({ connected: true } as any);
    const res = await app.inject({
      method: 'POST',
      url: '/api/wallet/connect',
      payload: { publicKey: 'p', signature: 's' }
    });
    expect(JSON.parse(res.payload).data.connected).toBe(true);
  });

  it('GET /api/wallet/pk/portfolio returns portfolio', async () => {
    walletMock.getPortfolio.mockResolvedValue({ totalValue: 1 } as any);
    const res = await app.inject({ method: 'GET', url: '/api/wallet/pk/portfolio' });
    expect(JSON.parse(res.payload).data.totalValue).toBe(1);
  });

  it('GET /api/wallet/pk/positions returns positions', async () => {
    walletMock.getPositions.mockResolvedValue([{} as any]);
    const res = await app.inject({ method: 'GET', url: '/api/wallet/pk/positions' });
    expect(JSON.parse(res.payload).data.length).toBe(1);
  });

  it('DELETE /api/wallet/pk/disconnect returns true', async () => {
    walletMock.disconnectWallet.mockResolvedValue(true);
    const res = await app.inject({ method: 'DELETE', url: '/api/wallet/pk/disconnect' });
    expect(JSON.parse(res.payload).data.disconnected).toBe(true);
  });

  it('GET /api/analytics/performance/pk returns metrics', async () => {
    analyticsMock.getPerformance.mockResolvedValue({ totalReturn: 1 } as any);
    const res = await app.inject({ method: 'GET', url: '/api/analytics/performance/pk' });
    expect(JSON.parse(res.payload).data.totalReturn).toBe(1);
  });

  it('GET /api/analytics/market-overview returns overview', async () => {
    analyticsMock.getMarketOverview.mockResolvedValue({ totalTvl: 10 } as any);
    const res = await app.inject({ method: 'GET', url: '/api/analytics/market-overview' });
    expect(JSON.parse(res.payload).data.totalTvl).toBe(10);
  });

  it('GET /api/analytics/opportunities returns opportunities', async () => {
    analyticsMock.getOpportunities.mockResolvedValue([{ poolId: '1' } as any]);
    const res = await app.inject({ method: 'GET', url: '/api/analytics/opportunities' });
    expect(JSON.parse(res.payload).data[0].poolId).toBe('1');
  });
});
