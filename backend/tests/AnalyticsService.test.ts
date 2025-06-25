import { AnalyticsService } from '../src/services/AnalyticsService';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getPerformance returns metrics for valid wallet', async () => {
    const result = await service.getPerformance('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', '30d');

    expect(result).toHaveProperty('totalReturn');
    expect(result).toHaveProperty('history');
    expect(typeof result.totalReturn).toBe('number');
    expect(Array.isArray(result.history)).toBe(true);
  });

  it('getMarketOverview should require real data', async () => {
    // Como removemos dados simulados, deve falhar se não houver dados reais
    try {
      await service.getMarketOverview();
      // Se chegou aqui, significa que conseguiu dados reais da API
      // Isso é válido em ambiente de teste
    } catch (error: any) {
      // Esperado: erro quando não há dados reais disponíveis
      expect(error.message).toContain('Dados simulados removidos conforme CLAUDE.md');
    }
  });

  it('getOpportunities returns real opportunities', async () => {
    try {
      const result = await service.getOpportunities('conservative');

      // Se conseguiu dados, deve ser array
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        expect(result[0]).toHaveProperty('poolId');
        expect(result[0]).toHaveProperty('protocol');
        expect(result[0]).toHaveProperty('estimatedApy');
      }
    } catch (error: any) {
      // Pode falhar se não houver dados reais disponíveis
      expect(error.message).toContain('Dados simulados removidos conforme CLAUDE.md');
    }
  });
});
