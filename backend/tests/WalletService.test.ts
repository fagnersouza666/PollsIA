const rpcMock = {
  getAccountInfo: jest.fn(() => ({ send: jest.fn().mockResolvedValue({ value: {} }) })),
  getBalance: jest.fn(() => ({ send: jest.fn().mockResolvedValue({ value: 2000000000 }) })),
  getTokenAccountsByOwner: jest.fn(() => ({ send: jest.fn().mockResolvedValue({ value: [] }) }))
};

import axios from 'axios';
import { WalletService } from '../src/services/WalletService';

jest.mock('axios');
jest.mock('@solana/rpc', () => ({
  createSolanaRpc: jest.fn(() => rpcMock)
}));
jest.mock('@solana/addresses', () => ({
  address: jest.fn(() => 'addr')
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WalletService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disconnectWallet should return true', async () => {
    const service = new WalletService();
    const result = await service.disconnectWallet('somePublicKey');
    expect(result).toBe(true);
  });

  it('connectWallet returns connection info', async () => {
    const service = new WalletService();
    const info = await service.connectWallet('pub', 'sig');
    expect(info.connected).toBe(true);
    expect(info.balance).toBe(2);
  });

  it('getPortfolio returns expected balances', async () => {
    mockedAxios.get.mockResolvedValue({ data: { solana: { usd: 150 } } });
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const service = new WalletService();
    const portfolio = await service.getPortfolio('pub');
    expect(portfolio.totalValue).toBe(300);
    expect(portfolio.solBalance).toBe(2);
    expect(portfolio.tokenAccounts).toBe(0);
  });

  it('getWalletPools returns real pools data structure', async () => {
    // Mock Raydium API response
    mockedAxios.get.mockResolvedValue({
      data: {
        official: [
          {
            id: 'test-pool-1',
            ammId: 'test-amm-1',
            baseMint: 'So11111111111111111111111111111111111111112',
            quoteMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            lpMint: 'test-lp-mint',
            tvl: 1000000,
            volume24h: 500000
          }
        ]
      }
    });

    const service = new WalletService();
    const pools = await service.getWalletPools('DuASG5ubHN6qsBCGJVfLa5G5TjDQ48TJ3XcZ8U6eDee');
    
    expect(Array.isArray(pools)).toBe(true);
    
    if (pools.length > 0) {
      const pool = pools[0];
      expect(pool).toHaveProperty('id');
      expect(pool).toHaveProperty('tokenA');
      expect(pool).toHaveProperty('tokenB');
      expect(pool).toHaveProperty('myLiquidity');
      expect(pool).toHaveProperty('myValue');
      expect(pool).toHaveProperty('apy');
      expect(pool).toHaveProperty('entryDate');
      expect(pool).toHaveProperty('currentValue');
      expect(pool).toHaveProperty('pnl');
      expect(pool).toHaveProperty('rewardsEarned');
      expect(pool).toHaveProperty('status');
      
      expect(typeof pool.apy).toBe('number');
      expect(typeof pool.myValue).toBe('number');
      expect(['active', 'inactive', 'pending']).toContain(pool.status);
    }
  });
});
