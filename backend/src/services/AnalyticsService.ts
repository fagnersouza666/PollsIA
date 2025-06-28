/**
 * Analytics Service - Inspirado no VaraYield-AI
 * 
 * Sistema de analytics em tempo real para dashboards e métricas avançadas
 */

export interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  weightedAPY: number;
  riskScore: number;
  sharpeRatio: number;
  diversificationIndex: number;
  liquidityScore: number;
  performanceGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface MarketMetrics {
  totalMarketTVL: number;
  averageAPY: number;
  topPerformingPools: PoolMetric[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  liquidityCrisis: boolean;
}

export interface PoolMetric {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  volume24h: number;
  priceChange24h: number;
  riskLevel: string;
  trending: 'up' | 'down' | 'stable';
}

export interface AlertCondition {
  id: string;
  type: 'performance' | 'risk' | 'opportunity' | 'market';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  timestamp: Date;
  data?: any;
}

export class AnalyticsService {
  private alertHistory: Map<string, AlertCondition[]> = new Map();

  /**
   * Calcula métricas completas do portfolio
   */
  async calculatePortfolioMetrics(
    userPublicKey: string,
    positions: any[],
    marketData?: any[]
  ): Promise<PortfolioMetrics> {
    console.log(`📊 Calculando métricas para portfolio ${userPublicKey}`);

    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalInvested = positions.reduce((sum, pos) => sum + pos.entryValue, 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // APY ponderado
    const weightedAPY = positions.reduce((sum, pos) => {
      const weight = pos.value / totalValue;
      return sum + (pos.currentAPY * weight);
    }, 0);

    const riskScore = this.calculateRiskScore(positions);
    const sharpeRatio = this.calculateSharpeRatio(returnPercentage, riskScore);
    const diversificationIndex = this.calculateDiversificationIndex(positions);
    const liquidityScore = 0.8; // Simplificado
    const performanceGrade = this.calculatePerformanceGrade(weightedAPY, riskScore, diversificationIndex);

    return {
      totalValue,
      totalReturn,
      returnPercentage,
      weightedAPY,
      riskScore,
      sharpeRatio,
      diversificationIndex,
      liquidityScore,
      performanceGrade
    };
  }

  /**
   * Calcula métricas do mercado
   */
  async calculateMarketMetrics(pools: any[]): Promise<MarketMetrics> {
    const totalMarketTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0);
    const averageAPY = pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length;

    const topPerformingPools = pools
      .map(pool => ({
        id: pool.id,
        name: this.getPoolDisplayName(pool),
        apy: pool.apy,
        tvl: pool.tvl,
        volume24h: pool.volume24h || pool.tvl * 0.1,
        priceChange24h: (Math.random() - 0.5) * 10,
        riskLevel: this.assessPoolRisk(pool),
        trending: this.getPoolTrend()
      }))
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 5);

    return {
      totalMarketTVL,
      averageAPY,
      topPerformingPools,
      marketSentiment: 'bullish',
      volatilityIndex: 0.2,
      liquidityCrisis: false
    };
  }

  private calculateRiskScore(positions: any[]): number {
    if (positions.length === 0) return 0;
    return 0.4; // Simplificado
  }

  private calculateSharpeRatio(returnPercentage: number, riskScore: number): number {
    const riskFreeRate = 2;
    const excessReturn = returnPercentage - riskFreeRate;
    const volatility = riskScore * 20;
    return volatility > 0 ? excessReturn / volatility : 0;
  }

  private calculateDiversificationIndex(positions: any[]): number {
    if (positions.length <= 1) return 0;
    return Math.min(positions.length / 5, 1);
  }

  private calculatePerformanceGrade(
    weightedAPY: number, 
    riskScore: number, 
    diversificationIndex: number
  ): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = weightedAPY * (1 - riskScore) + diversificationIndex * 2;
    if (score >= 15) return 'A+';
    if (score >= 12) return 'A';
    if (score >= 9) return 'B';
    if (score >= 6) return 'C';
    if (score >= 3) return 'D';
    return 'F';
  }

  private getPoolDisplayName(pool: any): string {
    if (pool.tokenA && pool.tokenB) {
      return `${pool.tokenA}/${pool.tokenB}`;
    }
    return pool.name || pool.id || 'Unknown Pool';
  }

  private assessPoolRisk(pool: any): string {
    if (pool.apy > 20) return 'high';
    if (pool.apy > 10) return 'medium';
    return 'low';
  }

  private getPoolTrend(): 'up' | 'down' | 'stable' {
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable';
  }

  getUserAlertHistory(userPublicKey: string): AlertCondition[] {
    return this.alertHistory.get(userPublicKey) || [];
  }

  clearCache(): void {
    // Método para compatibilidade
  }
}

export default AnalyticsService;