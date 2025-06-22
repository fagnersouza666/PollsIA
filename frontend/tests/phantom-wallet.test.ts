import { PhantomWalletService } from '../src/utils/phantom-wallet';

// Tipo de teste para window.solana

describe('PhantomWalletService', () => {
  const service = new PhantomWalletService();

  afterEach(() => {
    (window as any).solana = undefined;
  });

  test('isPhantomInstalled detects installation', async () => {
    (window as any).solana = { isPhantom: true };
    expect(await service.isPhantomInstalled()).toBe(true);
  });

  test('connect throws when not installed', async () => {
    await expect(service.connect()).rejects.toThrow('Phantom wallet não detectado');
  });
});
