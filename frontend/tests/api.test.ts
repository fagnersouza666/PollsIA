import { api } from '../src/utils/api';

const fetchMock = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ data: 'ok' })
})) as jest.Mock;

(global as any).fetch = fetchMock;

afterEach(() => {
  fetchMock.mockClear();
});

test('discoverPools calls correct endpoint', async () => {
  await api.discoverPools();
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/pools/discover', expect.any(Object));
});

test('getPortfolio calls wallet endpoint', async () => {
  await api.getPortfolio('pub');
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/wallet/pub/portfolio', expect.any(Object));
});

test('getWalletPools calls wallet pools endpoint', async () => {
  await api.getWalletPools('pub', 'active', 'value');
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/wallet/pub/pools?status=active&sortBy=value', expect.any(Object));
});
