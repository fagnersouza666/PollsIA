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
});
