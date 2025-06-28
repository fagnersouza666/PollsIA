/**
 * Risk Management Service - Inspirado no VaraYield-AI
 * 
 * Sistema de níveis de risco para otimização de yield farming
 * Conservative, Moderate, Aggressive strategies
 */

export interface RiskProfile {
  id: string;
  name: string;
  description: string;
  minAPY: number;
  maxRisk: number;
  rebalanceThreshold: number;
  maxPositionSize: number;
  allowedProtocols: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface OptimizationStrategy {
  riskProfile: RiskProfile;
  allocation: {
    poolId: string;
    percentage: number;
    reasoning: string;
  }[];
  expectedAPY: number;
  riskScore: number;
  confidence: number;
}

export class RiskManagementService {
  private readonly riskProfiles: Map<string, RiskProfile> = new Map();

  constructor() {
    this.initializeRiskProfiles();
  }

  private initializeRiskProfiles(): void {
    // Conservative Strategy - Inspirado no VaraYield-AI
    this.riskProfiles.set('conservative', {
      id: 'conservative',
      name: 'Conservative',
      description: 'Foco em estabilidade e proteção do capital. APY moderado mas seguro.',
      minAPY: 3.0,
      maxRisk: 0.3,
      rebalanceThreshold: 0.05, // 5% de mudança no APY
      maxPositionSize: 0.4, // Máximo 40% em uma pool
      allowedProtocols: ['Raydium', 'Marinade', 'Serum'],
      colors: {
        primary: '#10B981', // Green
        secondary: '#34D399',
        accent: '#059669'
      }
    });

    // Moderate Strategy - Equilibrio risco/retorno
    this.riskProfiles.set('moderate', {
      id: 'moderate',
      name: 'Moderate',
      description: 'Equilibrio entre risco e retorno. APY atrativo com risco controlado.',
      minAPY: 6.0,
      maxRisk: 0.6,
      rebalanceThreshold: 0.1, // 10% de mudança no APY
      maxPositionSize: 0.6, // Máximo 60% em uma pool
      allowedProtocols: ['Raydium', 'Serum', 'Port Finance', 'Marinade'],
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#60A5FA',
        accent: '#1D4ED8'
      }
    });

    // Aggressive Strategy - Máximo yield
    this.riskProfiles.set('aggressive', {
      id: 'aggressive',
      name: 'Aggressive',
      description: 'Máximo yield possível. Alto risco, alto retorno para investidores experientes.',
      minAPY: 12.0,
      maxRisk: 1.0,
      rebalanceThreshold: 0.15, // 15% de mudança no APY
      maxPositionSize: 0.8, // Máximo 80% em uma pool
      allowedProtocols: ['Raydium', 'Serum', 'Port Finance', 'Experimental'],
      colors: {
        primary: '#EF4444', // Red
        secondary: '#F87171',
        accent: '#DC2626'
      }
    });
  }

  /**
   * Calcula estratégia otimizada baseada no perfil de risco
   */
  async optimizeAllocation(
    riskProfileId: string,
    availablePools: any[],
    userBalance: number
  ): Promise<OptimizationStrategy> {
    console.log(`🎯 Otimizando alocação para perfil: ${riskProfileId}`);
    
    const riskProfile = this.riskProfiles.get(riskProfileId);
    if (!riskProfile) {
      throw new Error(`Perfil de risco '${riskProfileId}' não encontrado`);
    }

    // Filtrar pools baseado no perfil de risco
    const suitablePools = this.filterPoolsByRisk(availablePools, riskProfile);
    
    // Calcular alocação otimizada
    const allocation = this.calculateOptimalAllocation(suitablePools, riskProfile);
    
    // Calcular métricas esperadas
    const { expectedAPY, riskScore, confidence } = this.calculateExpectedMetrics(allocation, suitablePools);

    console.log(`✅ Estratégia ${riskProfile.name}: APY esperado ${expectedAPY.toFixed(2)}%`);

    return {
      riskProfile,
      allocation,
      expectedAPY,
      riskScore,
      confidence
    };
  }

  /**
   * Filtra pools baseado no perfil de risco
   */
  private filterPoolsByRisk(pools: any[], riskProfile: RiskProfile): any[] {
    return pools.filter(pool => {
      // Verificar APY mínimo
      if (pool.apy < riskProfile.minAPY) return false;
      
      // Verificar protocolos permitidos
      if (!riskProfile.allowedProtocols.includes(pool.protocol?.split(' ')[0])) return false;
      
      // Verificar TVL mínimo (proxy de segurança)
      const minTVL = riskProfile.id === 'conservative' ? 5000000 : 
                   riskProfile.id === 'moderate' ? 1000000 : 
                   100000;
      if (pool.tvl < minTVL) return false;
      
      return true;
    });
  }

  /**
   * Calcula alocação otimizada usando algoritmo inspirado no VaraYield-AI
   */
  private calculateOptimalAllocation(pools: any[], riskProfile: RiskProfile): any[] {
    console.log(`🧮 Calculando alocação otimizada para ${pools.length} pools`);
    
    // Ordenar pools por score de eficiência
    const scoredPools = pools.map(pool => ({
      ...pool,
      efficiencyScore: this.calculateEfficiencyScore(pool, riskProfile)
    })).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

    const allocation: any[] = [];
    let remainingPercentage = 100;

    // Distribuir baseado no perfil de risco
    for (const pool of scoredPools) {
      if (remainingPercentage <= 0) break;
      
      // Calcular percentual baseado na eficiência e limites do perfil
      let percentage = Math.min(
        remainingPercentage,
        riskProfile.maxPositionSize * 100,
        pool.efficiencyScore * 100
      );

      // Para perfil conservador, distribuir mais uniformemente
      if (riskProfile.id === 'conservative') {
        percentage = Math.min(percentage, 25); // Máximo 25% por pool
      }

      if (percentage >= 5) { // Mínimo 5% para incluir
        allocation.push({
          poolId: pool.id,
          percentage: Math.round(percentage * 100) / 100,
          reasoning: this.generateReasoning(pool, riskProfile, percentage)
        });
        
        remainingPercentage -= percentage;
      }
    }

    // Normalizar percentuais para somar 100%
    const totalPercentage = allocation.reduce((sum, alloc) => sum + alloc.percentage, 0);
    if (totalPercentage > 0) {
      allocation.forEach(alloc => {
        alloc.percentage = (alloc.percentage / totalPercentage) * 100;
      });
    }

    return allocation.slice(0, riskProfile.id === 'conservative' ? 3 : 5);
  }

  /**
   * Calcula score de eficiência de uma pool
   */
  private calculateEfficiencyScore(pool: any, riskProfile: RiskProfile): number {
    const apyWeight = 0.4;
    const tvlWeight = 0.3;
    const stabilityWeight = 0.2;
    const protocolWeight = 0.1;

    // Normalizar APY (0-1)
    const apyScore = Math.min(pool.apy / 50, 1); // Máximo 50% APY
    
    // Normalizar TVL (0-1)
    const tvlScore = Math.min(pool.tvl / 100000000, 1); // Máximo 100M TVL
    
    // Score de estabilidade (baseado no protocolo)
    const stabilityScore = pool.protocol?.includes('Raydium') ? 0.9 :
                          pool.protocol?.includes('Serum') ? 0.8 :
                          pool.protocol?.includes('Marinade') ? 0.95 :
                          0.7;
    
    // Score do protocolo (baseado no perfil de risco)
    const protocolScore = riskProfile.allowedProtocols.includes(pool.protocol?.split(' ')[0]) ? 1 : 0.5;

    return (apyScore * apyWeight) + 
           (tvlScore * tvlWeight) + 
           (stabilityScore * stabilityWeight) + 
           (protocolScore * protocolWeight);
  }

  /**
   * Gera reasoning para alocação
   */
  private generateReasoning(pool: any, riskProfile: RiskProfile, percentage: number): string {
    const reasons = [];
    
    if (pool.apy > riskProfile.minAPY * 1.5) {
      reasons.push(`APY atrativo de ${pool.apy.toFixed(1)}%`);
    }
    
    if (pool.tvl > 10000000) {
      reasons.push('Alta liquidez');
    }
    
    if (pool.protocol?.includes('Raydium')) {
      reasons.push('Protocolo estabelecido');
    }
    
    if (percentage > 30) {
      reasons.push('Alocação principal');
    } else if (percentage > 15) {
      reasons.push('Alocação significativa');
    } else {
      reasons.push('Diversificação');
    }

    return reasons.join(', ');
  }

  /**
   * Calcula métricas esperadas
   */
  private calculateExpectedMetrics(allocation: any[], pools: any[]): {
    expectedAPY: number;
    riskScore: number;
    confidence: number;
  } {
    const poolMap = new Map(pools.map(p => [p.id, p]));
    
    let weightedAPY = 0;
    let weightedRisk = 0;
    let totalWeight = 0;

    for (const alloc of allocation) {
      const pool = poolMap.get(alloc.poolId);
      if (pool) {
        const weight = alloc.percentage / 100;
        weightedAPY += pool.apy * weight;
        weightedRisk += this.calculatePoolRisk(pool) * weight;
        totalWeight += weight;
      }
    }

    const expectedAPY = totalWeight > 0 ? weightedAPY : 0;
    const riskScore = totalWeight > 0 ? weightedRisk : 0;
    const confidence = Math.min(totalWeight * allocation.length * 0.2, 1); // Max 1.0

    return { expectedAPY, riskScore, confidence };
  }

  /**
   * Calcula risco de uma pool individual
   */
  private calculatePoolRisk(pool: any): number {
    let risk = 0;
    
    // Risco baseado em APY (APY muito alto = maior risco)
    if (pool.apy > 20) risk += 0.3;
    else if (pool.apy > 10) risk += 0.1;
    
    // Risco baseado em TVL (TVL baixo = maior risco)
    if (pool.tvl < 1000000) risk += 0.4;
    else if (pool.tvl < 5000000) risk += 0.2;
    
    // Risco baseado no protocolo
    if (pool.protocol?.includes('Experimental')) risk += 0.5;
    else if (!pool.protocol?.includes('Raydium') && !pool.protocol?.includes('Marinade')) risk += 0.1;
    
    return Math.min(risk, 1);
  }

  /**
   * Retorna todos os perfis de risco disponíveis
   */
  getRiskProfiles(): RiskProfile[] {
    return Array.from(this.riskProfiles.values());
  }

  /**
   * Retorna um perfil de risco específico
   */
  getRiskProfile(id: string): RiskProfile | undefined {
    return this.riskProfiles.get(id);
  }

  /**
   * Verifica se rebalanceamento é necessário
   */
  async shouldRebalance(
    currentAllocation: any[],
    currentPools: any[],
    riskProfileId: string
  ): Promise<boolean> {
    const riskProfile = this.riskProfiles.get(riskProfileId);
    if (!riskProfile) return false;

    const newStrategy = await this.optimizeAllocation(riskProfileId, currentPools, 1000); // Mock balance
    
    // Verificar mudanças significativas
    for (const currentAlloc of currentAllocation) {
      const newAlloc = newStrategy.allocation.find(a => a.poolId === currentAlloc.poolId);
      
      if (!newAlloc) continue;
      
      const percentageChange = Math.abs(newAlloc.percentage - currentAlloc.percentage) / currentAlloc.percentage;
      
      if (percentageChange > riskProfile.rebalanceThreshold) {
        return true;
      }
    }

    return false;
  }
}

export default RiskManagementService;