import { WalletService } from './WalletService';
import { PoolService } from './PoolService';

export class AnalyticsService {
  private walletService: WalletService;
  private poolService: PoolService;

  constructor() {
    this.walletService = new WalletService();
    this.poolService = new PoolService();
  }

  async getPerformance(publicKey: string, timeframe: string = '30d') {
    try {
      // Get current portfolio value
      const portfolio = await this.walletService.getPortfolio(publicKey);
      const currentValue = portfolio.totalValue;
      
      // For real implementation, you'd track portfolio history
      // For now, simulate some basic performance metrics
      const simulatedHistory = this.generatePerformanceHistory(currentValue, timeframe);
      const metrics = this.calculatePerformanceMetrics(simulatedHistory);
      
      return {
        ...metrics,
        timeframe,
        history: simulatedHistory
      };
    } catch (error) {
      console.error('Error calculating performance:', error);
      return {
        totalReturn: 0,
        alpha: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        timeframe,
        history: []
      };
    }
  }

  private generatePerformanceHistory(currentValue: number, timeframe: string) {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const history = [];
    
    // Generate realistic portfolio value history
    let value = currentValue * 0.95; // Start 5% lower
    const dailyVolatility = 0.02; // 2% daily volatility
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic market movement
      const randomChange = (Math.random() - 0.5) * dailyVolatility * 2;
      const trendChange = i < days ? 0.001 : 0; // Slight upward trend
      value *= (1 + randomChange + trendChange);
      
      history.push({
        date: date.toISOString().split('T')[0],
        value: Number(value.toFixed(2))
      });
    }
    
    // Set the last value to current value
    history[history.length - 1].value = currentValue;
    
    return history;
  }

  private calculatePerformanceMetrics(history: Array<{date: string, value: number}>) {
    if (history.length < 2) {
      return {
        totalReturn: 0,
        alpha: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const initialValue = history[0].value;
    const finalValue = history[history.length - 1].value;
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < history.length; i++) {
      const dailyReturn = (history[i].value - history[i-1].value) / history[i-1].value;
      returns.push(dailyReturn);
    }

    // Calculate Sharpe ratio (simplified)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnStdDev = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0; // Annualized

    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = history[0].value;
    
    for (const point of history) {
      if (point.value > peak) peak = point.value;
      const drawdown = (peak - point.value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Simplified alpha calculation (vs SOL)
    const alpha = totalReturn - 5; // Assume SOL returned 5% as benchmark

    return {
      totalReturn: Number(totalReturn.toFixed(1)),
      alpha: Number(alpha.toFixed(1)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      maxDrawdown: Number((-maxDrawdown * 100).toFixed(1))
    };
  }

  async getMarketOverview() {
    try {
      // Get real pool data for market overview
      const pools = await this.poolService.discoverPools();
      
      if (pools.length === 0) {
        return this.getFallbackMarketOverview();
      }

      // Calculate aggregated metrics
      const totalTvl = pools.reduce((sum, pool) => sum + pool.tvl, 0);
      const averageApy = pools.reduce((sum, pool) => sum + pool.apy, 0) / pools.length;
      
      // Group by protocol
      const protocolStats = pools.reduce((acc, pool) => {
        if (!acc[pool.protocol]) {
          acc[pool.protocol] = { tvl: 0, pools: 0 };
        }
        acc[pool.protocol].tvl += pool.tvl;
        acc[pool.protocol].pools += 1;
        return acc;
      }, {} as Record<string, {tvl: number, pools: number}>);

      const topPools = Object.entries(protocolStats)
        .map(([protocol, stats]) => ({ protocol, ...stats }))
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 5);

      return {
        totalTvl: Number(totalTvl.toFixed(0)),
        averageApy: Number(averageApy.toFixed(1)),
        topPools,
        marketTrends: {
          tvlChange24h: (Math.random() - 0.5) * 10, // Simulated for now
          volumeChange24h: (Math.random() - 0.5) * 15,
          newPools24h: Math.floor(Math.random() * 5)
        }
      };
    } catch (error) {
      console.error('Error getting market overview:', error);
      return this.getFallbackMarketOverview();
    }
  }

  private getFallbackMarketOverview() {
    return {
      totalTvl: 0,
      averageApy: 0,
      topPools: [],
      marketTrends: {
        tvlChange24h: 0,
        volumeChange24h: 0,
        newPools24h: 0
      }
    };
  }

  async getOpportunities(riskLevel?: string) {
    try {
      // Get real pools and calculate opportunities
      const pools = await this.poolService.discoverPools();
      const rankings = await this.poolService.getRankings();
      
      // Create opportunities from top-ranked pools
      const opportunities = rankings
        .slice(0, 10) // Top 10 pools
        .map(ranking => {
          const pool = pools.find(p => p.id === ranking.poolId);
          if (!pool) return null;

          const confidence = Math.min(ranking.score / 100, 0.95);
          const reason = this.generateOpportunityReason(pool, ranking);

          return {
            poolId: pool.id,
            protocol: pool.protocol,
            tokenA: pool.tokenA,
            tokenB: pool.tokenB,
            estimatedApy: pool.apy,
            riskScore: ranking.riskScore,
            confidence,
            reason
          };
        })
        .filter(opp => opp !== null);

      // Filter by risk level if provided
      if (riskLevel && opportunities.length > 0) {
        const riskThreshold = riskLevel === 'conservative' ? 5 : 
                             riskLevel === 'moderate' ? 7 : 10;
        return opportunities.filter(opp => opp!.riskScore <= riskThreshold);
      }

      return opportunities;
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return [];
    }
  }

  private generateOpportunityReason(pool: any, ranking: any): string {
    const reasons = [];
    
    if (pool.apy > 15) reasons.push('High APY potential');
    if (ranking.liquidityScore > 8) reasons.push('Strong liquidity');
    if (ranking.riskScore < 5) reasons.push('Low risk profile');
    if (pool.volume24h / pool.tvl > 0.2) reasons.push('High trading activity');
    
    return reasons.join(' + ') || 'Balanced risk-reward profile';
  }
}